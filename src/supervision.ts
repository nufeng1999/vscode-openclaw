import * as vscode from 'vscode';
import { genId } from './utils';

/**
 * 督导功能相关方法
 * 设计模式与 agentTree.ts 一致：以 chatView 实例为第一个参数导出独立函数
 * ChatViewLike 为结构化类型（鸭子类型），避免在 supervision.ts 中引入循环依赖
 */
export interface ChatViewLike {
  gateway: any; // OpenClawGateway
  log: (msg: string) => void;
  postToWebview: (msg: any) => void;
  supervisionEnabled: boolean;
  supervisionTimer: NodeJS.Timeout | null;
  lastSupervisedContent: string;
  supervisorBusy: boolean;
  supervisorPendingSessionKey: string | null;
  supervisorResponseResolver: ((text: string | null) => void) | null;
  supervisorTimeout: NodeJS.Timeout | null;
  supervisorAccumulated: string;
  gwSessionKey: (localKey?: string) => string;
  extractHistoryContent: (content: any) => Promise<string>;

}

export async function handleToggleSupervision(cv: ChatViewLike, enabled: boolean) {
  cv.log(`handleToggleSupervision called with enabled=${enabled}`);
  cv.supervisionEnabled = enabled;
  cv.log(`Supervision ${enabled ? 'enabled' : 'disabled'}`);
  cv.postToWebview({ type: 'supervisionState', enabled });

  if (enabled) {
    cv.log("About to call startSupervision()");
    await startSupervision(cv);
    cv.log("startSupervision() returned");
  } else {
    cv.log("About to call stopSupervision()");
    stopSupervision(cv);
    cv.log("stopSupervision() returned");
  }
}

export async function startSupervision(cv: ChatViewLike) {
  cv.log(`startSupervision called, supervisionEnabled=${cv.supervisionEnabled}, timer=${cv.supervisionTimer !== null}`);
  if (cv.supervisionTimer) {
    cv.log("Timer already running, skipping start");
    return;
  }

  const config = vscode.workspace.getConfiguration("openclaw");
  const intervalMinutes = config.get<number>("supervisor.intervalMinutes", 5) || 5;
  const reminderMessage = config.get<string>("supervisor.reminderMessage", "") || "";
  const agentId = config.get<string>("supervisor.agentId", "") || "";
  const stopInquiryMethod = config.get<string>("supervisor.stopInquiryMethod", "") || "";
  const stopSignalReply = config.get<string>("supervisor.stopSignalReply", "yes") || "yes";
  const stopSignalContent = config.get<string>("supervisor.stopSignalContent", "") || "";

  cv.log(`Config read: interval=${intervalMinutes}min, agentId=${agentId}, reminder=${reminderMessage.substring(0, 30)}, inquiryMethod=${stopInquiryMethod}, stopSignal=${stopSignalReply}, stopSignalContent=${stopSignalContent.substring(0, 30)}`);

  if (!agentId) {
    cv.log("ERROR: agentId is empty! Cannot start supervision.");
    vscode.window.showWarningMessage(vscode.l10n.t("OpenClaw: Supervisor agent ID not configured"));
    cv.supervisionEnabled = false;
    return;
  }

  cv.log(`Starting supervision with interval ${intervalMinutes}min, agent=${agentId}`);

  // --- Hello handshake: connect the supervisor agent (one-time) ---
  const supervisorSessionKey = `agent:${agentId}:main`;
  const HELLO_MESSAGE = "hello， Next, we are ready to have a dialogue on supervision and judgment.Do not reply to the previous sentence.";
  cv.log(`Sending supervisor handshake: ${HELLO_MESSAGE}`);
  try {
    const runId = genId();
    await cv.gateway.request("chat.send", {
      sessionKey: supervisorSessionKey,
      message: HELLO_MESSAGE,
      deliver: false,
      idempotencyKey: runId
    });
    const handshakeReply = await waitForSupervisorResponse(cv, supervisorSessionKey, 30000);
    cv.log(`Supervisor handshake completed. Supervisor agent reply: ${handshakeReply ? handshakeReply : "(no reply within timeout)"}`);
  } catch (err: any) {
    cv.log(`Supervisor handshake failed: ${err?.message || err}`);
  }

  // Run immediately, then on interval
  cv.supervisionTimer = setInterval(async () => {
    cv.log("Interval timer fired, calling runSupervisionCheck...");
    await runSupervisionCheck(cv, intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent);
    cv.log("runSupervisionCheck completed");
  }, intervalMinutes * 60 * 1000);

  // Also run once immediately
  cv.log("Running immediate supervision check...");
  runSupervisionCheck(cv, intervalMinutes, reminderMessage, agentId, stopInquiryMethod, stopSignalReply, stopSignalContent).then(() => {
    cv.log("Immediate supervision check completed");
  }).catch((err: any) => {
    cv.log(`Immediate supervision check error: ${err.message}`);
  });
}

export function stopSupervision(cv: ChatViewLike) {
  cv.log(`stopSupervision called, timer=${cv.supervisionTimer !== null}`);
  if (cv.supervisionTimer) {
    clearInterval(cv.supervisionTimer);
    cv.supervisionTimer = null;
    cv.log("Supervision timer cleared");
  }
  if (cv.supervisorBusy) {
    cv.log("WARNING: supervisorBusy is still true, clearing it");
    cv.supervisorBusy = false;
  }
  if (cv.supervisorTimeout) {
    clearTimeout(cv.supervisorTimeout);
    cv.supervisorTimeout = null;
    cv.log("Supervisor request timeout cleared");
  }
  cv.supervisorPendingSessionKey = null;
  cv.supervisorResponseResolver = null;
  cv.supervisorAccumulated = "";
}

export async function runSupervisionCheck(
  cv: ChatViewLike,
  intervalMinutes: number,
  reminderMessage: string,
  agentId: string,
  stopInquiryMethod: string,
  stopSignalReply: string,
  stopSignalContent: string
) {
  cv.log(`runSupervisionCheck called: supervisionEnabled=${cv.supervisionEnabled}, supervisorBusy=${cv.supervisorBusy}`);
  if (!cv.supervisionEnabled) {
    cv.log("Supervision not enabled, returning");
    return;
  }

  try {
    cv.log(`Fetching chat history for session: ${cv.gwSessionKey()}`);
    const res = await cv.gateway.request("chat.history", {
      sessionKey: cv.gwSessionKey(),
      limit: 10
    });
    const msgs = res?.messages || [];
    cv.log(`chat.history returned ${msgs.length} messages`);

    let lastContent = "";
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      cv.log(`  Checking message ${i}: role=${m.role}, hasContent=${!!m.content}`);
      if (m.role === "assistant") {
        const text = await cv.extractHistoryContent(m.content);
        cv.log(`  Assistant message text length: ${text?.length || 0}`);
        if (text && !text.startsWith("HEARTBEAT")) {
          lastContent = text;
          cv.log(`  Found last assistant content (length=${lastContent.length}), breaking`);
          break;
        }
      }
    }

    cv.log(`Supervision check: last content length=${lastContent.length}, previous=${cv.lastSupervisedContent.length}`);

    const isFirstCheck = cv.lastSupervisedContent.length === 0;

    if (cv.supervisorBusy) {
      cv.log(`Supervisor inquiry skipped: already busy`);
      return;
    }

    cv.supervisorBusy = true;
    cv.log(`Inquiring supervisor every check: ${agentId}`);
    const inquiry = `${stopInquiryMethod}：${lastContent}`;
    const supervisorSessionKey = `agent:${agentId}:main`;
    cv.log(`Sending inquiry to supervisor session ${supervisorSessionKey}: ${inquiry.substring(0, 50)}...`);

    const runId = genId();
    try {
      await cv.gateway.request("chat.send", {
        sessionKey: supervisorSessionKey,
        message: inquiry,
        deliver: false,
        idempotencyKey: runId
      });

      cv.log(`Waiting for supervisor response (timeout 120s)...`);
      const reply = await waitForSupervisorResponse(cv, supervisorSessionKey);

      if (reply && reply.toLowerCase().trim() === stopSignalReply.toLowerCase().trim()) {
        cv.log(`Supervisor replied with stop signal: "${reply}"`);
        cv.supervisionEnabled = false;
        stopSupervision(cv);
        cv.postToWebview({ type: 'supervisionState', enabled: false });
        vscode.window.showInformationMessage(vscode.l10n.t("Supervision stopped by supervisor agent"));
        cv.supervisorBusy = false;
        return;
      } else {
        cv.log(`Supervisor replied: ${reply?.substring(0, 50)}... (not stop signal, continuing)`);
      }
      cv.supervisorBusy = false;
    } catch (err: any) {
      cv.log(`Supervisor inquiry failed: ${err.message}`);
      cv.supervisorBusy = false;
    }

    if (isFirstCheck) {
      cv.log(`First check, storing content baseline (length=${lastContent.length})`);
      cv.lastSupervisedContent = lastContent;
      return;
    }

    if (lastContent === cv.lastSupervisedContent && lastContent.length > 0) {
      cv.log(`Content SAME (length=${lastContent.length}) → sending reminder`);
      if (reminderMessage) {
        cv.log(`Sending reminder to active agent: ${reminderMessage.substring(0, 50)}...`);
        const runId2 = genId();
        try {
          await cv.gateway.request("chat.send", {
            sessionKey: cv.gwSessionKey(),
            message: reminderMessage,
            deliver: false,
            idempotencyKey: runId2
          });
          cv.log(`Reminder sent successfully`);
        } catch (err: any) {
          cv.log(`Reminder send failed: ${err.message}`);
        }
      } else {
        cv.log(`WARNING: reminderMessage is empty, skip sending`);
      }
    } else if (lastContent !== cv.lastSupervisedContent && lastContent.length > 0) {
      cv.log(`Content DIFFERENT: previous=${cv.lastSupervisedContent.length}, current=${lastContent.length}`);
      if (stopSignalContent) {
        const stopSignals = stopSignalContent.split("|").map(s => s.trim()).filter(s => s.length > 0);
        if (stopSignals.some(signal => lastContent.includes(signal))) {
          cv.log(`stopSignalContent matched in changed content: "${stopSignalContent.substring(0, 30)}"`);
          cv.supervisionEnabled = false;
          stopSupervision(cv);
          cv.postToWebview({ type: 'supervisionState', enabled: false });
          vscode.window.showInformationMessage(vscode.l10n.t("Supervision stopped: stop signal content detected"));
          return;
        } else {
          cv.log(`stopSignalContent not matched (or empty), continuing`);
        }
      }
    } else {
      cv.log(`Last content is empty, updating baseline`);
    }

    cv.lastSupervisedContent = lastContent;
  } catch (err: any) {
    cv.log(`Supervision check error: ${err.message}`);
  }
}

export function waitForSupervisorResponse(cv: ChatViewLike, supervisorSessionKey: string, timeoutMs = 120000): Promise<string | null> {
  return new Promise((resolve) => {
    cv.supervisorPendingSessionKey = supervisorSessionKey;
    cv.supervisorResponseResolver = resolve;
    cv.supervisorAccumulated = "";

    const timeout = setTimeout(() => {
      cv.log(`Supervisor response timeout after ${timeoutMs}ms (accumulated=${cv.supervisorAccumulated.length})`);
      cv.supervisorTimeout = null;
      cv.supervisorPendingSessionKey = null;
      cv.supervisorResponseResolver = null;
      resolve(cv.supervisorAccumulated || null);
    }, timeoutMs);

    cv.supervisorTimeout = timeout;
  });
}
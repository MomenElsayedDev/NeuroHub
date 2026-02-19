/**
 * AIRIAGUARD OS ENGINE
 * Multi-Agent Orchestration, Secure CRUD, HITL, Slack Notifications
 */
const AiriaEngine = {
  vault: JSON.parse(localStorage.getItem("airia_vault_pro")) || [
    { id: "AR-901", name: "Google Cloud Master SLA", value: 1250000, agent: "Legal-A1", status: "Verified" },
    { id: "AR-902", name: "NVIDIA H100 GPU Lease", value: 450000, agent: "Finance-X", status: "Audited" },
  ],

  init() {
    this.refreshUI();
    this.logToTerminal("System Ready. Multi-Agent Fleet Standing By.");
    if (localStorage.getItem("theme") === "dark") toggleTheme();
  },

  logToTerminal(msg, type = "info") {
    const feed = document.getElementById("terminalFeed");
    const timestamp = new Date().toLocaleTimeString();
    const div = document.createElement("div");
    div.textContent = `[${timestamp}] ${msg}`;
    div.className = type === "error" ? "err" : type === "success" ? "success" : "";
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  },

  async sendSlackNotification(message) {
    const webhookURL = "YOUR_SLACK_WEBHOOK_URL";
    if (!webhookURL || webhookURL === "YOUR_SLACK_WEBHOOK_URL") return;
    try {
      await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
      this.logToTerminal(`Slack-Agent: Message sent -> "${message}"`, "success");
    } catch (err) {
      this.logToTerminal(`Slack-Agent Error: ${err.message}`, "error");
    }
  },

  async hitlRiskCheck(item) {
    if (parseFloat(item.value) > HITL_THRESHOLD) {
      return confirm(`High-value asset detected: $${parseFloat(item.value).toLocaleString()}. Approve ingestion manually?`);
    }
    return true;
  },

  refreshUI(filteredData = null) {
    const body = document.getElementById("vaultBody");
    const data = filteredData || this.vault;
    body.innerHTML = "";
    let totalWealth = 0;

    data.forEach((item, idx) => {
      totalWealth += parseFloat(item.value);
      const tr = document.createElement("tr");
      tr.className = "animate__animated animate__fadeIn";

      tr.innerHTML = `
        <td><code style="background:var(--bg-app); padding:4px 8px; border-radius:5px;">${item.id}</code></td>
        <td style="font-weight:700;"></td>
        <td style="font-weight:800; color:var(--primary);">$${parseFloat(item.value).toLocaleString()}</td>
        <td><span class="badge bg-legal"></span></td>
        <td><span class="badge bg-fin"><i class="fas fa-check"></i> ${item.status}</span></td>
        <td>
          <div style="display:flex; gap:10px;">
            <button data-idx="${idx}" class="editBtn" style="background:none; border:none; color:var(--info); cursor:pointer;"><i class="fas fa-pencil"></i></button>
            <button data-idx="${idx}" class="deleteBtn" style="background:none; border:none; color:var(--danger); cursor:pointer;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tr.querySelector("td:nth-child(2)").textContent = item.name;
      tr.querySelector(".badge.bg-legal").textContent = item.agent;

      body.appendChild(tr);
    });

    document.getElementById("valCounter").textContent = "$" + totalWealth.toLocaleString();
    localStorage.setItem("airia_vault_pro", JSON.stringify(this.vault));

    // ACTIVE AGENTS
    const totalAgents = this.vault.length;
    const verifiedAgents = this.vault.filter(i => i.status === "Verified").length;
    document.getElementById("activeAgentsCount").textContent = `${verifiedAgents}/${totalAgents}`;
    document.getElementById("agentsStatus").textContent = verifiedAgents === totalAgents ? "Healthy Pulse" : "Attention Required";

    // RISK INDEX
    const hasHighRisk = this.vault.some(i => parseFloat(i.value) > HITL_THRESHOLD);
    document.getElementById("riskIndex").textContent = hasHighRisk ? "High" : "Nominal";
    document.getElementById("riskStatus").textContent = hasHighRisk ? "Critical asset detected" : "No critical breaches";

    // Attach buttons
    document.querySelectorAll(".editBtn").forEach(btn => btn.onclick = () => this.edit(parseInt(btn.dataset.idx)));
    document.querySelectorAll(".deleteBtn").forEach(btn => btn.onclick = () => this.delete(parseInt(btn.dataset.idx)));
  },

  delete(index) {
    if (confirm("Are you sure you want to remove this asset from the secure vault?")) {
      this.logToTerminal(`Archiving record: ${this.vault[index].name}...`);
      this.vault.splice(index, 1);
      this.refreshUI();
    }
  },

  edit(index) {
    const item = this.vault[index];
    document.getElementById("editIndex").value = index;
    document.getElementById("inpName").value = item.name;
    document.getElementById("inpVal").value = item.value;
    document.getElementById("commitBtn").disabled = false;
    openModal();
  },

  async runWorkflow() {
    const pContainer = document.getElementById("pContainer");
    const pFill = document.getElementById("pFill");
    const pStatus = document.getElementById("pStatus");
    const pPercent = document.getElementById("pPercent");
    const btn = document.getElementById("aiActionBox");

    pContainer.style.display = "block";
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.5";

    const steps = [
      { msg: "Orchestrator: Initiating Airia API handshake...", p: 20 },
      { msg: "Discovery-Agent: Scanning document entities...", p: 40 },
      { msg: "Legal-Agent: Validating jurisdiction clauses...", p: 60 },
      { msg: "Finance-Agent: Calculating asset NPV...", p: 80 },
      { msg: "Slack-Agent: Broadcasting to #legal...", p: 100 },
    ];

    for (let step of steps) {
      pStatus.textContent = step.msg;
      pFill.style.width = step.p + "%";
      pPercent.textContent = step.p + "%";
      this.logToTerminal(step.msg);
      if (step.msg.includes("Slack-Agent")) {
        await this.sendSlackNotification("Workflow completed successfully.");
      }
      await new Promise(r => setTimeout(r, 700));
    }

    // Auto-fill with random discovery
    const discoveryPool = [
      { name: "SpaceX Starlink Expansion", val: 2400000 },
      { name: "OpenAI Enterprise API License", val: 150000 },
      { name: "Tesla Giga-Factory SOW", val: 900000 },
      { name: "Microsoft Azure Node Cluster", val: 320000 },
    ];
    const randomMatch = discoveryPool[Math.floor(Math.random() * discoveryPool.length)];

    document.getElementById("inpName").value = randomMatch.name;
    document.getElementById("inpVal").value = randomMatch.val;
    document.getElementById("commitBtn").disabled = false;

    pStatus.textContent = "Discovery Successful!";
    this.logToTerminal("Workflow Completed. Metadata Structuring Success.", "success");
  },
};

function nav(pageId, btn) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  btn.classList.add("active");

  const headers = {
    dash: ["Intelligence Hub", "Real-time multi-agent orchestration monitor."],
    vault: ["Secure Asset Vault", "Persistent storage for AI-verified contracts."],
    fleet: ["Multi-Agent Fleet", "Control and monitor specialized AI units."],
    integrations: ["External Workflows", "Manage Slack, Discord, and SMTP webhooks."],
    settings: ["Core Configuration", "Adjust platform security and API parameters."],
  };
  document.getElementById("pageTitle").textContent = headers[pageId][0];
  document.getElementById("pageDesc").textContent = headers[pageId][1];

  document.getElementById("addBtn").style.display = pageId === "settings" || pageId === "integrations" ? "none" : "flex";
}

function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById("themeIcon");
  if (html.getAttribute("data-theme") === "light") {
    html.setAttribute("data-theme", "dark");
    icon.className = "fas fa-sun";
    localStorage.setItem("theme", "dark");
  } else {
    html.setAttribute("data-theme", "light");
    icon.className = "fas fa-moon";
    localStorage.setItem("theme", "light");
  }
}

const HITL_THRESHOLD = 1000000;

document.getElementById("updateBtn").addEventListener("click", () => {
  const assetName = document.getElementById("assetName").value.trim();
  const assetValue = parseFloat(document.getElementById("assetValue").value);
  const log = document.getElementById("log");

  if (!assetName || isNaN(assetValue)) {
    alert("⚠️ Please fill in all fields with valid values.");
    return;
  }

  if (assetValue > HITL_THRESHOLD && !confirm(`⚠️ High value ($${assetValue}). Confirm update?`)) {
    log.textContent += `❌ Update for ${assetName} cancelled.\n`;
    return;
  }

  const idx = AiriaEngine.vault.findIndex(item => item.name === assetName);
  if (idx !== -1) {
    AiriaEngine.vault[idx].value = assetValue;
    log.textContent += `✅ ${assetName} updated with value $${assetValue}.\n`;
  } else {
    const newAsset = { id: "AR-" + (Math.floor(Math.random() * 900) + 100), name: assetName, value: assetValue, agent: "Manual-AI", status: "Verified" };
    AiriaEngine.vault.unshift(newAsset);
    log.textContent += `🆕 ${assetName} added with value $${assetValue}.\n`;
  }
  AiriaEngine.refreshUI();
});

function searchVault(query) {
  const filtered = AiriaEngine.vault.filter(
    i => i.name.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())
  );
  AiriaEngine.refreshUI(filtered);
}

function openModal() {
  document.getElementById("modalOverlay").style.display = "flex";
}
function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("ingestForm").reset();
  document.getElementById("editIndex").value = "";
  document.getElementById("pContainer").style.display = "none";
  document.getElementById("pFill").style.width = "0%";
  document.getElementById("commitBtn").disabled = true;
  document.getElementById("aiActionBox").style.pointerEvents = "auto";
  document.getElementById("aiActionBox").style.opacity = "1";
}

function startMultiAgentWorkflow() {
  AiriaEngine.runWorkflow();
}

document.getElementById("ingestForm").onsubmit = async function (e) {
  e.preventDefault();
  const idx = document.getElementById("editIndex").value;
  const newItem = {
    id: "AR-" + (Math.floor(Math.random() * 900) + 100),
    name: document.getElementById("inpName").value.trim(),
    value: parseFloat(document.getElementById("inpVal").value),
    agent: "Discovery-AI",
    status: "Verified",
  };

  if (isNaN(newItem.value) || !newItem.name) {
    alert("⚠️ Invalid asset data.");
    return;
  }

  const approved = await AiriaEngine.hitlRiskCheck(newItem);
  if (!approved) {
    AiriaEngine.logToTerminal(`Ingestion cancelled by HITL for ${newItem.name}.`, "error");
    return;
  }

  if (idx === "") {
    AiriaEngine.vault.unshift(newItem);
    AiriaEngine.logToTerminal(`New Entry: ${newItem.name} ingested successfully.`);
    await AiriaEngine.sendSlackNotification(`New asset ingested: ${newItem.name} ($${newItem.value})`);
  } else {
    AiriaEngine.vault[idx] = newItem;
    AiriaEngine.logToTerminal(`Record Updated: ${newItem.name}.`);
    await AiriaEngine.sendSlackNotification(`Asset updated: ${newItem.name} ($${newItem.value})`);
  }

  closeModal();
  AiriaEngine.refreshUI();
};

window.onload = () => AiriaEngine.init();
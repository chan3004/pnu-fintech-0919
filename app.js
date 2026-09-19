// F-01 자본금 맞춤 계산기 — 계산·검증 함수 (docs/requirements.md R-01~R-03)

function parseAmount(raw) {
  if (raw === undefined || raw === null) return NaN;
  const s = String(raw).trim();
  if (s === "") return NaN;
  const cleaned = s.replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

function calcDownPayment(priceRaw, capitalRaw, ratePercentRaw) {
  // 분양가: 빈값(R-02) → 오류(R-03) → 정상(R-01) 순으로 검사
  if (priceRaw === undefined || priceRaw === null || String(priceRaw).trim() === "") {
    return { error: "분양가를 입력해주세요. 관심 있는 단지의 예상 분양가를 직접 넣어야 계산할 수 있어요." };
  }
  const price = parseAmount(priceRaw);
  if (isNaN(price) || price <= 0) {
    return { error: "분양가는 0보다 큰 숫자로 입력해주세요. 예: 400000000" };
  }

  if (capitalRaw === undefined || capitalRaw === null || String(capitalRaw).trim() === "") {
    return { error: "보유 자본금을 입력해주세요." };
  }
  const capital = parseAmount(capitalRaw);
  if (isNaN(capital) || capital < 0) {
    return { error: "보유 자본금은 0 이상의 숫자로 입력해주세요." };
  }

  let rate = ratePercentRaw;
  if (rate === undefined || rate === null || String(rate).trim() === "") rate = 20;
  rate = parseAmount(rate);
  if (isNaN(rate) || rate <= 0 || rate > 100) {
    return { error: "계약금 비율은 1~100 사이의 숫자로 입력해주세요." };
  }

  const required = Math.round(price * (rate / 100));
  const diff = capital - required;
  const status = diff >= 0 ? "가능" : "부족";
  return { required: required, diff: Math.abs(diff), status: status };
}

function formatWon(n) {
  return Number(n).toLocaleString("ko-KR") + "원";
}

function renderResult(result) {
  const el = document.getElementById("result");
  const errEl = document.getElementById("priceError");
  errEl.textContent = "";
  el.className = "";
  el.innerHTML = "";

  if (result.error) {
    errEl.textContent = result.error;
    return;
  }

  if (result.status === "가능") {
    el.className = "result ok";
    el.innerHTML =
      "지금 자본금으로 계약금을 충분히 감당할 수 있어요.<br>" +
      "필요 계약금 " + formatWon(result.required) + "(분양가 기준) · 남는 금액 " + formatWon(result.diff);
  } else {
    el.className = "result bad";
    el.innerHTML =
      "지금 자본금으로는 계약금이 부족해요.<br>" +
      "필요 계약금 " + formatWon(result.required) + "(분양가 기준) · 부족 금액 " + formatWon(result.diff);
  }
}

function onCalculate() {
  const price = document.getElementById("price").value;
  const capital = document.getElementById("capital").value;
  const rate = document.getElementById("rate").value;
  const result = calcDownPayment(price, capital, rate);
  renderResult(result);
}

function populateComplexList() {
  const sel = document.getElementById("complex");
  const data = window.SH_HOUSING_2026;
  if (!data || !data.rows) {
    document.getElementById("dataError").textContent =
      "청약 목록을 불러오지 못했습니다. data.js 파일을 확인해주세요.";
    return;
  }
  data.rows.forEach(function (row) {
    const opt = document.createElement("option");
    opt.value = row.complex + " " + row.unitType + "㎡";
    opt.textContent = row.complex + " (" + row.unitType + "㎡, 공급 " + row.year + "년 " + row.month + "월)";
    sel.appendChild(opt);
  });
  document.getElementById("sourceLine").textContent =
    "출처: " + data.source + " · " + data.registered + " 등록 · " + data.updated + " 수정";
}

document.addEventListener("DOMContentLoaded", function () {
  populateComplexList();
  document.getElementById("calcBtn").addEventListener("click", onCalculate);
});

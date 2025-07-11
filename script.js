const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromAmount = document.getElementById("fromAmount");
const toAmount = document.getElementById("toAmount");
const updated = document.getElementById("updated");

let rates = {};

const CURRENCIES = [
  "USD", "EUR", "KZT", "GBP", "JPY", "CNY", "RUB", "AED",
  "BTC", "ETH", "BNB", "TON", "USDT", "XAU", "XAG"
];

async function fetchRates() {
  const fiatUrl = "https://api.exchangerate.host/latest?base=USD";
  const cryptoUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,toncoin,tether&vs_currencies=usd";
  const metalUrl = "https://api.coingecko.com/api/v3/simple/price?ids=gold,silver&vs_currencies=usd";

  const [fiatRes, cryptoRes, metalRes] = await Promise.all([
    fetch(fiatUrl).then(r => r.json()),
    fetch(cryptoUrl).then(r => r.json()),
    fetch(metalRes).then(r => r.json())
  ]);

  rates = { ...fiatRes.rates };

  rates["BTC"] = 1 / cryptoRes.bitcoin.usd;
  rates["ETH"] = 1 / cryptoRes.ethereum.usd;
  rates["BNB"] = 1 / cryptoRes.binancecoin.usd;
  rates["TON"] = 1 / cryptoRes.toncoin.usd;
  rates["USDT"] = 1 / cryptoRes.tether.usd;

  rates["XAU"] = 1 / metalRes.gold.usd;
  rates["XAG"] = 1 / metalRes.silver.usd;

  updated.textContent = "⏱ Обновлено: " + new Date().toLocaleTimeString();
}

function populateCurrencies() {
  CURRENCIES.forEach(cur => {
    const opt1 = document.createElement("option");
    opt1.value = opt1.text = cur;
    const opt2 = opt1.cloneNode(true);
    fromCurrency.appendChild(opt1);
    toCurrency.appendChild(opt2);
  });
  fromCurrency.value = "USD";
  toCurrency.value = "KZT";
}

function convert() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(fromAmount.value);

  if (isNaN(amount) || !rates[from] || !rates[to]) {
    toAmount.value = "Ошибка";
    return;
  }

  const usdAmount = amount / rates[from]; // → в USD
  const result = usdAmount * rates[to];   // → из USD
  toAmount.value = result.toFixed(2);
}

document.getElementById("swapBtn").addEventListener("click", () => {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convert();
});

fromCurrency.addEventListener("change", convert);
toCurrency.addEventListener("change", convert);
fromAmount.addEventListener("input", convert);

populateCurrencies();
fetchRates().then(convert);
setInterval(() => fetchRates().then(convert), 60000); // обновление раз в минуту
const searchBaseUrl = "https://api.coingecko.com/api/v3/coins/";
let currencyForReport = [];
const cache = {};


const DOM = {
  Monitoring: document.querySelector("#Monitoring"),
  information: document.querySelector("#information"),
  inputSearch: null,
  buttonSearch: null,
  element: null,
};

createCurrencies();

function init() {
  drawCoins("");
  drawMonitoring();
}

function drawMonitoring() {
  const MonitoringsUi = [];
  DOM.inputSearch = getInput("search", ["form-control"]);
  DOM.buttonSearch = getButton("Search");
  DOM.buttonSearch.addEventListener("click", function () {
    const value = DOM.inputSearch.value;
    drawCoins(value);
  });
  MonitoringsUi.push(DOM.inputSearch, DOM.buttonSearch);
  DOM.Monitoring.append(...MonitoringsUi);
}

async function drawCoins(filterStr) {
  try {
    showLoader(DOM.Monitoring);

    let result = await getAllCoinsApi();
    if (result && !result.error && result.length > 0) {
      if (filterStr)
        result = result.filter((coin) =>
          coin.symbol.toLowerCase() === filterStr.toLowerCase()
        );

      const coins = result.slice(0, 100);
      // coinList = coins;
      await showAllCoins(coins);
      applyChecked();
      DOM.information.innerHTML = "";
    } else {
      const h1 = document.createElement("h1");
      h1.innerText = "No Data";
      DOM.information.innerHTML = "";
      DOM.information.append(h1);
    }
  } catch (error) {
    console.log(error);
    DOM.information.innerText = "An error occurred while loading data.";
  } finally {
    removeLoader();
  }
}

async function getAllCoinsApi() {
  const result = await fetch(`${searchBaseUrl}`, {
    method: "GET",
  });
  const resultJson = await result.json();
  return resultJson;
}

async function showAllCoins(coins) {
  const cardContainer = document.querySelector("#card-container");
  const fragment = document.createDocumentFragment();


  for (let i = 0; i < coins.length && i < 100; i++) {
    const card = document.createElement("div");
    card.className = "card";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    if (coins[i]) {
      cardBody.id = coins[i].id;

      const symbol = document.createElement("h5");
      symbol.innerText = coins[i].symbol;
      symbol.className = "card-title";

      const nameOfCoin = document.createElement("p");
      nameOfCoin.innerText = coins[i].name;
      nameOfCoin.className = "card-text";

      const toggle = document.createElement("div");
      toggle.className = "form-check form-switch";



      const input = document.createElement("input");
      input.className = "form-check-input";
      input.type = "checkbox";
      input.role = "switch";
      input.id = "checkbox" + coins[i].id;
      toggle.append(input);

      const button = document.createElement("button");
      button.className = "btn btn-warning";
      button.innerText = "more info";
      button.id = "button";
      button.addEventListener("click", async function () {
        showLoader(button);
        await moreInfo(coins[i].id);
        removeLoader();
      });
      cardBody.appendChild(nameOfCoin);
      cardBody.appendChild(symbol);
      cardBody.appendChild(toggle);
      cardBody.appendChild(button);
      card.appendChild(cardBody);
      fragment.appendChild(card);

      input.addEventListener("change", function () {
        if (input.checked) {
          if (currencyForReport.length > 4) {
            input.checked = false;
            removeFromReportModal(coins[i], input);
          } else currencyForReport.push({ input: input, coin: coins[i] });
        } else currencyForReport = currencyForReport.filter((x) => x.coin.id !== coins[i].id);
      });
    }
  }

  cardContainer.innerHTML = "";
  cardContainer.appendChild(fragment);
}

function removeFromReportModal(newCoin, input) {
  var myModal = new bootstrap.Modal(document.getElementById("myModal"), {
    keyboard: false,
  });

  document.getElementById("CurenciesForDelete").innerHTML = "";

  currencyForReport.forEach((coinData) => {
    const button = document.createElement("button");
    button.className = "btn btn-danger btn-del-coin";
    button.innerText = coinData.coin.name;
    button.addEventListener("click", function () {
      currencyForReport.find(
        (x) => x.coin.id == coinData.coin.id
      ).input.checked = false;
      currencyForReport = currencyForReport.filter(
        (x) => x.coin.id !== coinData.coin.id
      );
      currencyForReport.push({ input: input, coin: newCoin });
      myModal.hide();
      input.checked = true;
    });

    document.getElementById("CurenciesForDelete").appendChild(button);
  });

  myModal.show();
}

function applyChecked() {
  currencyForReport.forEach((x) => {
    const input = document.getElementById("checkbox" + x.coin.id);
    if (input) {
      input.checked = true;
      x.input = input;
    }
  });
}

function createCurrencies() {
  DOM.information.innerHTML = "";
  init();
}

function removeCurrency() {
  Object.keys(DOM)
    .filter((x) => DOM[x])
    .forEach((x) => (DOM[x].innerHTML = ""));

  document.querySelector("#card-container").innerHTML = "";
}


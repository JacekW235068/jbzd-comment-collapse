
// the trick is that slider has 0-100 range (100/10)^2 = 100
expoSliderValue = (v) => {
  x = Math.pow(parseFloat(v)/10, 2.0)
  x = x*10.0 // to milisecs
  return parseInt(x)
}

valueSliderExpo = (x) => {
  x = x / 10.0
  v = Math.sqrt(x)
  return v*10
}

function saveOptions(e) {
    browser.storage.sync.set({
      fade: document.querySelector("#fade").checked,
      collapseText: document.querySelector("#collapse").checked,
      animationSpeed: expoSliderValue(parseFloat(document.querySelector("#speed").value))
    });
    e.preventDefault();
  }
  
  function restoreOptions() {
    browser.storage.sync.get({
      fade: false,
      collapseText: true,
      animationSpeed: '8'
   }).then( (items) => {
      document.getElementById('fade').checked = items.fade;
      document.getElementById('collapse').checked = items.collapseText;
      e = document.getElementById("speed");
      e.value = valueSliderExpo(items.animationSpeed)
      document.getElementById('current-speed').innerText = `${items.animationSpeed}`;
      e.addEventListener('change' , (e) => {
        document.getElementById('current-speed').innerText = `${expoSliderValue(parseFloat(e.currentTarget.value))}`;
      })
    })
  }

  if (typeof browser === "undefined") {
    browser = chrome;
  }
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
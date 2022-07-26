const hh = document.getElementById('prevRaceTimeHH');
const mm = document.getElementById('prevRaceTimeMM');
const ss = document.getElementById('prevRaceTimeSS');
const msg = document.getElementById('messageBox');
const btnCalc = document.getElementById('btnCalc');
const btnReset = document.getElementById('btnReset');
const btnReturn = document.getElementById('btnHidePace');
const paceBoxElement = document.querySelector('.paceBox');
const recentRaceBoxElement = document.querySelector('.recentRace');
const fullForm = document.getElementById('previousTime');
const raceDist = document.getElementById('prevRaceDist');
const easyPaceElement = document.getElementById('easyPace');
const marathonPaceElement = document.getElementById('marathonPace');
const halfPaceElement = document.getElementById('halfMarathonPace');
const tempoPaceElement = document.getElementById('tempoPace');
const longIntPaceElement = document.getElementById('longIntPace');
const shortIntPaceElement = document.getElementById('shortIntPace');
const footerContent = document.getElementById('footerContent');

let timeInSeconds = 0;
let hours, minutes, seconds, vMax;
// Variables for paces
let easyPaceFast, easyPaceSlow, marPaceFast, marPaceSlow, halfPaceFast, halfPaceSlow, tempoPaceFast, tempoPaceSlow,
  longIntPaceFast, longIntPaceSlow, shortIntPaceFast, shortIntPaceSlow;

btnCalc.addEventListener('click', calculate);
btnReset.addEventListener('click', clear);
btnReturn.addEventListener('click', closePaces)

window.onload = function () {
  setFooter();
};

function setFooter() {
  footerContent.innerHTML = `©${new Date().getFullYear()} Glimmer Man Media`;
}

function calculate() {
  getNumbersFromInputs();
  if (checkTimeInputs()) {
    convertToSeconds(hours, minutes, seconds);
    vMax = getvo2Max(timeInSeconds);
    setPaces();
    easyPaceElement.innerHTML = `Easy/Long Run:<br />${convertToTimeFormat(easyPaceFast)}-${convertToTimeFormat(easyPaceSlow)} min/mile`;
    marathonPaceElement.innerHTML = `Marathon:<br />${convertToTimeFormat(marPaceFast)}-${convertToTimeFormat(marPaceSlow)} min/mile`;
    halfPaceElement.innerHTML = `Half Marathon:<br />${convertToTimeFormat(halfPaceFast)}-${convertToTimeFormat(halfPaceSlow)} min/mile`;
    tempoPaceElement.innerHTML = `Tempo:<br />${convertToTimeFormat(tempoPaceFast)}-${convertToTimeFormat(tempoPaceSlow)} min/mile`;
    longIntPaceElement.innerHTML = `Long Interval (800m+):<br />${convertToTimeFormat(longIntPaceFast)}-${convertToTimeFormat(longIntPaceSlow)} min/mile`;
    shortIntPaceElement.innerHTML = `Short Interval (<800m):<br />${convertToTimeFormat(shortIntPaceFast)}-${convertToTimeFormat(shortIntPaceSlow)} min/mile`;

    paceBoxElement.classList.remove('hidden');
    recentRaceBoxElement.classList.add('hidden');
  }
}

function checkTimeInputs() {
  if (hours === 0 && minutes === 0 && seconds === 0) {
    clearMessage();
    addMessage(`You must enter a time`);
  } else {
    let validNumbers = hours > 0 && hours < 25 && minutes < 60 && minutes > 0 && seconds > 0 && seconds < 60;
    if (validNumbers || !hh.value) {
      return true;
    } else {
      clearMessage();
      if (hours < 0) {
        addMessage(`${hours} hours? Please show me your time machine!\n`)
      }

      if (hours > 23) {
        addMessage(`${hours} hours? I can't compute races that take longer than a day.`)
      }

      if (minutes > 59 || minutes < 0) {
        addMessage(`${minutes} minutes? That ain't right. Enter a number from 0 to 59.`)
      }

      if (seconds > 59 || seconds < 0) {
        addMessage(`${seconds} seconds? Impossible! Enter a number from 0 to 59.`)
      }
      return false;
    }
  }
}

function convertToSeconds(h, m, s) {
  if (!h || hours < 1) {
    timeInSeconds = (m * 60) + s;
  } else if (!m) {
    addMessage('Minutes required.');
  } else {
    timeInSeconds = (h * 3600) + (m * 60) + s;
  }
}

function convertToTimeFormat(totalSeconds) {
  let hoursFromSec, minutesFromSec, secondsFromSec;

  if (totalSeconds >= 3600) {
    hoursFromSec = Math.trunc(totalSeconds / 3600);
    minutesFromSec = Math.trunc((totalSeconds % 3600) / 60);
    secondsFromSec = Math.trunc((totalSeconds % 3600) % 60);

    timeFormat = `${hoursFromSec}:` +
      `${minutesFromSec < 10 ? '0' + minutesFromSec : minutesFromSec}:` +
      `${secondsFromSec < 10 ? '0' + secondsFromSec : secondsFromSec}`;
  } else if (totalSeconds >= 60) {
    minutesFromSec = Math.trunc(totalSeconds / 60);
    secondsFromSec = totalSeconds % 60;

    timeFormat = `${minutesFromSec}:` +
      `${secondsFromSec < 10 ? '0' + secondsFromSec : secondsFromSec}`;
  } else {
    timeFormat = totalSeconds < 10 ? `0:0${totalSeconds}` : `0:${totalSeconds}`;
  }
  return timeFormat;
}

// Makes sure the inputs are converted to numbers
function getNumbersFromInputs() {
  hours = Number(hh.value);
  minutes = Number(mm.value);
  seconds = Number(ss.value);
}

function getVelocity() {
  let distance;
  switch (raceDist.value) {
    case '5000': distance = 5000;
      break;
    case '10000': distance = 10000;
      break;
    case 'half': distance = 21097.494;
      break;
    case 'marathon': distance = 42194.988;
      break;
  }

  let velocity = distance / (timeInSeconds / 60);
  return velocity;
}

function getvo2(velocity) {
  let vo2 = (0.182258 * velocity) + (0.000104 * (velocity ** 2)) - 4.6;
  return vo2;
}

function getvo2Max(prevTimeSeconds) {
  // Convert previous time to minutes
  let prevTimeMinutes = prevTimeSeconds / 60;
  let pctVo2Max = 0.8 + (0.1894393 * (Math.exp((-0.012778) * prevTimeMinutes))) + (0.2989558 * Math.exp(((-0.1932605) * prevTimeMinutes)));
  let vo2Max = getvo2(getVelocity()) / pctVo2Max;
  return vo2Max;
}

function setPaces() {
  // Set Easy Pace Range
  easyPaceFast = Math.round(getPaceFromVo2(vMax * 0.749) * 60);
  easyPaceSlow = Math.round(getPaceFromVo2(vMax * 0.702) * 60);

  // Set Marathon Pace Range
  marPaceFast = Math.round(getPaceFromVo2(vMax * 0.839) * 60);
  marPaceSlow = Math.round(getPaceFromVo2(vMax * 0.782) * 60);

  // Set Half Marathon Pace Range
  halfPaceFast = Math.round(getPaceFromVo2(vMax * 0.898) * 60);
  halfPaceSlow = Math.round(getPaceFromVo2(vMax * 0.834) * 60);

  // Set Tempo Pace Range
  tempoPaceFast = Math.round(getPaceFromVo2(vMax * 0.937) * 60);
  tempoPaceSlow = Math.round(getPaceFromVo2(vMax * 0.868) * 60);

  // Set Long Interval Pace Range
  longIntPaceFast = Math.round(getPaceFromVo2(vMax * 1.035) * 60);
  longIntPaceSlow = Math.round(getPaceFromVo2(vMax * 0.955) * 60);

  // Set Short Interval Pace Range
  shortIntPaceFast = Math.round(getPaceFromVo2(vMax * 1.154) * 60);
  shortIntPaceSlow = Math.round(getPaceFromVo2(vMax * 1.055) * 60);
}

function getPaceFromVo2(vo2) {
  // Returns pace in meters per minute
  let tempVelocity = 29.54 + (5.000663 * vo2) - (0.007546 * (vo2 ** 2));
  let paceMinutes = 1609.344 / tempVelocity;
  return paceMinutes;
}

function closePaces() {
  paceBoxElement.classList.add('hidden');
  recentRaceBoxElement.classList.remove('hidden');
}

function addMessage(message) {
  msg.textContent += message;
  msg.classList.remove('hidden');
}

function clearMessage() {
  msg.textContent = '';
  msg.classList.add('hidden');
}

function clear() {
  clearMessage();
  fullForm.reset();
}
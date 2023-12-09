"use strict";

import {
  __dictionary_errors__,
  getDaysOfTheMonth
} from "./modules/lib.js";
import {
  DayInformationBlock,
  Calendar
} from "./modules/ui.js";
import ListResidents from "./modules/ListResidents.js";

var tick;
var CURRENT_DATE = new Date();
const ANCHOR_DAY = new Date(2023, 10, 4);

const residents = new ListResidents();

const elementsForControl = {
  updatableElements: [],
  startUpdates() {
    const control = this;
  
    tick = window.requestAnimationFrame(update);

    function update() {
      control.updateElements();

      tick = window.requestAnimationFrame(update);
    }
  },
  stopUpdates() {
    window.cancelAnimationFrame(tick);
  },
  get updateElements() {
    const control = this;
    return function () {
      CURRENT_DATE = new Date();
      control.updatableElements.forEach(
        element => {
          if (element.isUpdatable) {
            element.update();
          }
        });
      };
    }
};

const __keys__ = {
  67: (e) => {
    /*press C*/
    const calendarIndex = 3;
    const calendar = elementsForControl.updatableElements[calendarIndex];
    
    if ("openOrClose" in calendar) {
      calendar.openOrClose();
    }
  },
  68: (e) => {
    //D
    console.log(window.innerWidth);
  }
};
Object.freeze(__keys__);

window.addEventListener("beforeload", () => {
  elementsForControl.stopUpdates();
});

document.onkeydown = (event) => {
  const pressedKey = event.keyCode;
  const action = __keys__[pressedKey];

  if (action) {
    action(event);
  }
};

document.addEventListener(
  "DOMContentLoaded", () => {
  const peopleFilePath = "../data/residents.json";
  
  fetch(peopleFilePath)
  .then(response => response.json())
  .then(data => {
    const people = data.people;

    if(people) {
      for (
        let cutIndex = 0,
         GROUP_SIZE = 2,
         order = 1;
        cutIndex < people.length;
        cutIndex += GROUP_SIZE,
         order++
       ) {
       residents.setResidents(
         people.slice(
           cutIndex, cutIndex + GROUP_SIZE
         ), 
         order
       );
      }
    } else {throw 404;}
    
    createUI().then(elements => {
      elementsForControl.updatableElements.push(
          ...elements.updatableElements
        );
      const $recentResidentsContainer =
        document.getElementById(
          "recent_residents"
        );
      const recentResidentsScrollMax =
        $recentResidentsContainer
          .scrollWidth -
        $recentResidentsContainer
          .clientWidth;

      $recentResidentsContainer
        .scrollTo(
          recentResidentsScrollMax / 2, 0
        );

      elementsForControl.startUpdates();

      document.getElementById(
        "refresh_button"
      ).onclick =  () => {
        document.title = "atualizando...";

        setTimeout(() => {
          window.location.reload();
        }, 30);
      };
        
      console.log("UI DONE!!!!");
    });
    
  })
  .catch(error => {
    __dictionary_errors__.say(error);
  });
});   

async function createUI() {
  const elements = {
      updatableElements: []
  };

  const work = new Promise(resolver => {
    const $recentResidentsContainer =
      document.getElementById("recent_residents");

    const $calendarContainer =
      document.getElementById("calendar_container");

    elements.updatableElements.push(
      new DayInformationBlock(
        $recentResidentsContainer, {
        title: "ontem",
        onupdate: config => {
            config.date = new Date(
              CURRENT_DATE.getFullYear(),
              CURRENT_DATE.getMonth(),
              CURRENT_DATE.getDate() - 1
          );
        },
        isUpdatable: true
      }),
      new DayInformationBlock(
        $recentResidentsContainer, {
        title: "hoje",
        onupdate: config => (config.date = CURRENT_DATE),
        isUpdatable: true
      }),
      new DayInformationBlock(
        $recentResidentsContainer, {
        title: "amanhã",
        onupdate: config => {
          config.date = new Date(
            CURRENT_DATE.getFullYear(),
            CURRENT_DATE.getMonth(),
            CURRENT_DATE.getDate() + 1
          );
        },
        isUpdatable: true
      }),
      new Calendar($calendarContainer)
    );

    resolver(elements);
  });

  return await work;
}

// exportando variaveis para serem usadas
// de forma global
export {
  ANCHOR_DAY,
  CURRENT_DATE,
  residents
};
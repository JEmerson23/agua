"use strict";
var tick;
var CURRENT_DATE = new Date();
const ANCHOR_DAY = new Date(2023, 10, 4);
const __id_history__ = [];
const people = [
    "Ailton",
    "Edvaldo",
    "Teresa",
    "Diu",
    "Leandro",
    "Cida",
    "Célio",
    "Valdecy",
    "Valdemir",
    "Marluce e Fabiana"
];
const residents = [];

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
            control.updatableElements.forEach(element => {
                if (element.isUpdatable) {
                    element.update();
                }
            });
        };
    }
};

const __keys__ = {
    67: function (e) {
        /*press C*/
        const calendarIndex = 3;
        const calendar = elementsForControl.updatableElements[calendarIndex];
        if ("openOrClose" in calendar) {
            calendar.openOrClose();
        }
    },
    68: function (e) {
        //D
        console.log(window.innerWidth);
    }
};
Object.freeze(__keys__);

for (
    let cutIndex = 0, GROUP_SIZE = 2, order = 1;
    cutIndex < people.length;
    cutIndex += GROUP_SIZE, order++
) {
    setResidents(people.slice(cutIndex, cutIndex + GROUP_SIZE), order);
}

window.addEventListener("beforeload", function () {
    elementsForControl.stopUpdates();
});

document.onkeydown = function (event) {
    const pressedKey = event.keyCode;
    const action = __keys__[pressedKey];
    if (action) {
        action(event);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    createUI().then(elements => {
        elementsForControl.updatableElements.push(
            ...elements.updatableElements
        );
        const $recentResidentsContainer =
            document.getElementById("recent_residents");
        const recentResidentsScrollMax =
            $recentResidentsContainer.scrollWidth -
            $recentResidentsContainer.clientWidth;

        $recentResidentsContainer.scrollTo(recentResidentsScrollMax / 2, 0);

        elementsForControl.startUpdates();

        document.getElementById("refresh_button").onclick = function () {
            document.title = "atualizando...";

            setTimeout(function () {
                window.location.reload();
            }, 30);
        };

        __createManifest();
        __createPageIcon();

        console.log("UI DONE!!!!");
    });
});

//funções
async function createUI() {
    const elements = {
        updatableElements: []
    };

    class Element {
        constructor(parent, options) {
            const defaultConfig = {
                date: CURRENT_DATE,
                onupdate: config => {
                    config.date = CURRENT_DATE;
                },
                isUpdatable: true,
                mainElement: "section",
                mainElementId: randomId(),
                _renderWork: null,
                style: {
                    blockClassName: ""
                }
            };

            const self = this;

            this.config = Object.assign(defaultConfig, options);

            this.style = Object.assign(
                {
                    setBlockClassName(value) {
                        if (value) {
                            this.blockClassName = value;
                        }

                        self.$mainElement.setAttribute(
                            "class",
                            this.blockClassName
                        );
                    },
                    set add(obj) {
                        if (typeof obj == "object") {
                            for (let [key, value] of Object.entries(obj)) {
                                this[key] = value;
                            }
                        }
                    }
                },
                this.config.style
            );

            this.$parent = parent;

            this.$mainElement = this.__createMainElement();
            this.style.setBlockClassName();

            if (!this.$mainElement) {
                throw new Error("$mainElement is not created");
            }

            this.mainElementContent = "";
        }

        get isUpdatable() {
            return this.config.isUpdatable;
        }

        __createMainElement() {
            const { config } = this;

            const $element = newElement(config.mainElement);

            $element.setAttribute("id", config.mainElementId);

            this.$parent.appendChild($element);

            return $element;
        }

        update() {
            if (this.config.onupdate) {
                if (this.config.onupdate(this.config, this) !== 0) {
                    this.render();
                }
            }
        }

        render() {
            if (this.config._renderWork) {
                this.config._renderWork.call(this, this);
            } else {
                this.$mainElement.textContent = this.mainElementContent;
            }
        }
    }

    class DayInformationBlock extends Element {
        constructor(parent, options) {
            super(
                parent,
                Object.assign(
                    {
                        date: new Date(),
                        title: "untitled",
                        onupdate: null,
                        isUpdatable: false,
                        style: {
                            blockClassName: "recent_information"
                        }
                    },
                    options
                )
            );

            this.style.add = {
                informationElementsAttributes: [
                    "title",
                    "date_information",
                    "residents_of_the_day"
                ],
                dateInformationBlockClassName: "date_information",
                dateInformationElementsAttributes: ["day", "date"]
            };

            this.elements = {
                informationElements: [],
                dateInformationElements: []
            };

            this.config._renderWork = self => {
                const informationElements = this.elements.informationElements;

                informationElements[0].textContent = `${this.config.title}`;

                ((elements, date) => {
                    elements[0].textContent = weekDayInPT(date.getDay());

                    elements[1].textContent = date.getDate();
                })(this.elements.dateInformationElements, this.config.date);

                (residents => {
                    Array.from(informationElements[2].children).forEach(
                        $element => $element.parentNode.removeChild($element)
                    );

                    residents.people.forEach(name => {
                        const $name = newElement("span"),
                            $breakLine = newElement("br");

                        $name.setAttribute(
                            "class",
                            `${self.style.blockClassName}__name`
                        );

                        $name.textContent = name;

                        informationElements[2].appendChild($name);

                        informationElements[2].appendChild($breakLine);
                    });
                })(chooseResidents(getDistributionDay(this.config.date)));
            };

            this._createElements();
            super.update();
            super.render();
        }

        _createElements() {
            const self = this;

            this.elements.informationElements = [
                newElement("h2"),
                newElement("p"),
                newElement("p")
            ];

            this.$mainElement.setAttribute("class", this.style.blockClassName);

            this.elements.dateInformationElements.push(
                newElement("span"),
                newElement("span")
            );

            this.elements.dateInformationElements.forEach(($element, index) => {
                const blockClassName = self.style.dateInformationBlockClassName;

                const attribute = self.style.dateInformationElementsAttributes;

                $element.setAttribute(
                    "class",
                    `${blockClassName}__${attribute[index]}`
                );
            });

            this.elements.informationElements.forEach(($element, index) => {
                $element.setAttribute(
                    "class",
                    `${self.style.blockClassName}__${self.style.informationElementsAttributes[index]}`
                );
            });

            this.elements.dateInformationElements.forEach($element => {
                self.elements.informationElements[1].appendChild($element);
            });

            this.elements.informationElements.forEach($element => {
                self.$mainElement.appendChild($element);
            });

            this.$parent.appendChild(this.$mainElement);
        }
    }

    class Calendar extends Element {
        static get N_DAYS() {
            return 31;
        }

        constructor(parent, options) {
            super(
                parent,
                Object.assign(
                    {
                        title: "Calendário",
                        date: CURRENT_DATE,
                        month: CURRENT_DATE.getMonth(),
                        daysOfTheMonth: getDaysOfTheMonth(
                            CURRENT_DATE.getMonth()
                        ),
                        style: {
                            blockClassName: "c_calendar"
                        },
                        state: 1
                    },
                    options
                )
            );

            this.style.add = {
                calendarState: ["closed", "opened"],
                informationBar: "information_bar",
                openAndCloseButton: "open_and_close_button",
                informationBarTitle: "information_bar_title",
                daysContainer: "days_container",
                dayElementClassName: "day"
            };

            this.elements = {
                $informationBar: null,
                $openAndCloseButton: null,
                $informationBarTitle: null,
                $daysContainer: null,
                days: []
            };

            this.config.onupdate = (config, self) => {
                config.date = CURRENT_DATE;

                if (config.month === config.date.getMonth()) {
                    return 0;
                } else {
                    config.month = config.date.getMonth();
                    config.daysOfTheMonth = getDaysOfTheMonth(config.month);
                    self._updateDaysElements();
                }
            };

            this.config._renderWork = self => {
                const { elements, config } = this;

                elements.$informationBarTitle.textContent = `${monthInPT(
                    config.date.getMonth()
                )} de ${config.date.getFullYear()}`;
            };

            this._createElements();
            this._changeState();
            super.render();
        }

        _changeState() {
            //inverter status
            this.config.state = Math.abs(this.config.state - 1);

            const style = this.style,
                state = style.calendarState[this.config.state],
                calendarClassName = `${style.blockClassName}-${state}`,
                buttonClassName = `${style.openAndCloseButton}-${state}`;

            const buttonContents = ["ver tudo", "fechar"];

            this.$mainElement.setAttribute("class", calendarClassName);

            this.elements.$openAndCloseButton.setAttribute(
                "class",
                buttonClassName
            );

            this.elements.$openAndCloseButton.textContent =
                buttonContents[this.config.state];

            return this.config.state;
        }

        openOrClose() {
            const self = this;
            const STATE = self._changeState();
            this.elements.days.forEach(day => {
                if (day.config.state != 2) {
                    day.updateState(STATE);
                }
            });
        }

        _createElements() {
            const self = this;
            const { elements, style } = this;

            elements.$informationBar = newElement("header");
            elements.$openAndCloseButton = newElement("button");
            elements.$informationBarTitle = newElement("h1");
            elements.$daysContainer = newElement("div");

            elements.$informationBar.setAttribute(
                "class",
                `${style.blockClassName}__${style.informationBar}`
            );

            elements.$informationBarTitle.setAttribute(
                "class",
                `${style.blockClassName}__${style.informationBarTitle}`
            );

            elements.$daysContainer.setAttribute(
                "class",
                `${style.blockClassName}__${style.daysContainer}`
            );

            this._createDaysElements();

            elements.$openAndCloseButton.addEventListener("click", function () {
                setTimeout(function () {
                    self.openOrClose();
                }, 25);
            });

            appendChildren(elements.$informationBar, [
                elements.$informationBarTitle,
                elements.$openAndCloseButton
            ]);

            appendChildren(this.$mainElement, [
                elements.$informationBar,
                elements.$daysContainer
            ]);
        }

        _createDaysElements() {
            const calendar = this;
            const { config, elements } = this;
            const days = config.daysOfTheMonth;

            class Day extends Element {
                constructor(parent, options) {
                    super(
                        parent,
                        Object.assign(
                            {
                                number: 0,
                                weekDay: 0,
                                day: "dia",
                                today: false,
                                information: {
                                    residentsOfTheDay: { people: [] }
                                },
                                isUpdatable: true,
                                state: 0
                            },
                            options
                        )
                    );

                    this.style.add = {
                        blockState: ["closed", "opened", "disabled"],
                        informationBox: "information_box",
                        number: "number",
                        numberToday: "today",
                        styleInformationBox: "style_information_box"
                    };

                    this.elements = {
                        $informationBox: null,
                        $styleInformationBox: null,
                        $header: null,
                        $listNames: null,
                        $number: null,
                        $day: null,
                        nameBoxes: []
                    };

                    this.config._renderWork = function (self) {
                        self.elements.$day.textContent = self.config.day;
                        self.elements.$number.setAttribute(
                            "class",
                            self.isToday ? self.style.numberToday : ""
                        );
                    };

                    this.config.onupdate = (config, self) => {
                        self._updateNameElements();
                    };

                    const day = this;
                    this.$mainElement.onclick = () => {
                        if (calendar.config.state == 0) {
                            day.updateState();
                        }
                    };

                    delete this.config.date;

                    this.updateState(this.config.state);
                    this._createElements();
                    this.__addToColumn();
                    super.render();
                }

                _createElements() {
                    const { config, elements, style } = this;

                    elements.$informationBox = newElement("div");
                    elements.$styleInformationBox = newElement("div");
                    elements.$header = newElement("header");
                    elements.$number = newElement("h2");
                    elements.$day = newElement("h3");
                    elements.$listNames = newElement("ul");

                    elements.$informationBox.setAttribute(
                        "class",
                        `${style.blockClassName}__${style.informationBox}`
                    );

                    elements.$styleInformationBox.setAttribute(
                        "class",
                        `${style.styleInformationBox}`
                    );

                    elements.$number.setAttribute(
                        "class",
                        `day__${style.number}`
                    );

                    elements.$number.textContent = config.number;

                    if (
                        config.information.residentsOfTheDay.people.length > 0
                    ) {
                        this._createNameElements(
                            config.information.residentsOfTheDay.people
                        );
                    }

                    appendChildren(elements.$header, [
                        elements.$number,
                        elements.$day
                    ]);

                    appendChildren(elements.$informationBox, [
                        elements.$header,
                        elements.$listNames
                    ]);

                    elements.$styleInformationBox.appendChild(
                        elements.$informationBox
                    );

                    this.$mainElement.appendChild(
                        elements.$styleInformationBox
                    );

                    this.updateState(config.state);
                }

                _updateNameElements() {
                    const { config, elements } = this;

                    config.information.residentsOfTheDay.people.forEach(
                        (name, index, people) => {
                            const nameBoxes = elements.nameBoxes;
                            if (index > nameBoxes.length) {
                                this._createNameElements(name);
                            } else {
                                nameBoxes.forEach(
                                    $element => ($element.textContent = name)
                                );
                            }
                        }
                    );
                }

                _createNameElements() {
                    const elements = this.elements;

                    Array.from(...arguments).forEach(name => {
                        const $element = newElement("li");

                        $element.textContent = name;

                        elements.$listNames.appendChild($element);

                        elements.nameBoxes.push($element);
                    });
                }

                __addToColumn() {
                    this.$mainElement.style.gridColumn = this.config.weekDay;
                }

                get isToday() {
                    return this.config.today;
                }

                set isToday(value) {
                    this.config.today = value;
                }

                get day() {
                    return this.config.day;
                }

                get numDay() {
                    return this.config.weekDay;
                }

                set numDay(value) {
                    this.config.weekDay = value;

                    this.__addToColumn();
                }

                set day(value) {
                    this.config.day = value;
                }

                get number() {
                    return this.config.number;
                }

                get state() {
                    return this.config.state;
                }

                get residents() {
                    return this.config.information.residentsOfTheDay.people;
                }

                set residents(objectResidents) {
                    this.config.information.residentsOfTheDay = objectResidents;

                    super.update();
                }

                updateState(state) {
                    if (state >= 0 && state <= 2) {
                        this.config.state = state;
                    } else {
                        if (state === 2) {
                            return;
                        }
                        this.config.state = Math.abs(this.config.state - 1);
                    }

                    this._changeState();
                }

                _changeState() {
                    this.$mainElement.setAttribute(
                        "class",
                        `${this.style.blockClassName}-${
                            this.style.blockState[this.config.state]
                        }`
                    );
                }
            }

            //create days
            const simulationDate = new Date(
                config.date.getFullYear(),
                config.date.getMonth(),
                1
            );

            for (let i = 0; i < Calendar.N_DAYS; i++) {
                const DAY = i + 1;
                simulationDate.setDate(DAY);
                const DAY_STATE = DAY > days ? 2 : 0;
                const isToday = DAY === config.date.getDate();

                elements.days.push(
                    new Day(elements.$daysContainer, {
                        number: DAY,
                        weekDay: simulationDate.getDay(),
                        day: weekDayInPT(simulationDate.getDay()),
                        today: isToday,
                        information: {
                            residentsOfTheDay: chooseResidents(
                                getDistributionDay(simulationDate)
                            )
                        },
                        state: DAY_STATE,
                        style: {
                            blockClassName: `${calendar.style.blockClassName}__${calendar.style.dayElementClassName}`
                        }
                    })
                );
            }
        }

        _updateDaysElements() {
            const { elements, config } = this;

            const simulationDate = new Date(
                config.date.getFullYear(),
                config.date.getMonth(),
                1
            );
            for (let i = 0; i < Calendar.N_DAYS; i++) {
                const day = elements.days[i];

                if (!day) {
                    continue;
                }

                if (i < config.daysOfTheMonth) {
                    const DAY = i + 1;

                    simulationDate.setDate(DAY);

                    const simulationResidents = chooseResidents(
                        getDistributionDay(simulationDate)
                    );

                    day.day = weekDayInPT(simulationDate.getDay());
                    day.numDay = simulationDate.getDay();
                    day.isToday =
                        simulationDate.getDate() == config.date.getDate();
                    day.residents = simulationResidents;
                } else {
                    day.updateState(2);
                }

                day.update();
            }
        }
    }

    const work = new Promise(resolver => {
        const $recentResidentsContainer =
            document.getElementById("recent_residents");

        const $calendarContainer =
            document.getElementById("calendar_container");

        elements.updatableElements.push(
            new DayInformationBlock($recentResidentsContainer, {
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
            new DayInformationBlock($recentResidentsContainer, {
                title: "hoje",
                onupdate: config => (config.date = CURRENT_DATE),
                isUpdatable: true
            }),
            new DayInformationBlock($recentResidentsContainer, {
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

function setResidents(names, order) {
    if (names.length == 0) {
        return;
    }

    class Residents {
        constructor(names, order) {
            this.people = names || [];
            this.day = order || residents.length || 1;
        }

        get order() {
            return this.day;
        }

        set order(n) {
            this.day = n;
        }
    }

    const newResidents = new Residents(names, order);

    residents.push(newResidents);
    residents.sort((a, b) => a.order - b.order);

    return residents;
}

function chooseResidents(distributionDay) {
    const chosen = residents.find(
        residents => residents.order == distributionDay
    );

    return chosen;
}

function getDistributionDay(date) {
    const START_DAY = ANCHOR_DAY.getDate();
    const CYCLE_SIZE = residents.length;
    const DAYS_ELAPSED = countDays();

    let result = Math.abs(
        DAYS_ELAPSED < 0
            ? DAYS_ELAPSED -
                  parseInt((DAYS_ELAPSED - START_DAY) / CYCLE_SIZE) * CYCLE_SIZE
            : DAYS_ELAPSED - parseInt(DAYS_ELAPSED / CYCLE_SIZE) * CYCLE_SIZE
    );

    function countDays() {
        const _CURRENT_DATE = date || CURRENT_DATE;
        const DIFFERENCE_IN_MILLISECONDS = _CURRENT_DATE - ANCHOR_DAY;
        const DIFFERENCE_IN_DAYS =
            DIFFERENCE_IN_MILLISECONDS / (1000 * 60 * 60 * 24);

        return parseInt(DIFFERENCE_IN_DAYS);
    }

    return result + 1;
}

function getDaysOfTheMonth(month, year) {
    if (!month) {
        return;
    }
    const YEAR = year || CURRENT_DATE.getFullYear();
    return new Date(YEAR, month + 1, 0).getDate();
}

function weekDayInPT(day) {
    return [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado"
    ][day];
}

function monthInPT(month) {
    return [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ][month];
}

function randomId(size) {
    if (!size) {
        size = 8;
    }

    size = Math.abs(parseInt(size));

    let newId = generate();

    try {
        if (__id_history__.some(createdId => createdId === newId)) {
            throw 0;
        }
    } catch (e) {
        if (e === 0) {
            newId = generate();
        }
    } finally {
        __id_history__.push(newId);
    }

    function generate() {
        const RGB_GENERATIONS = size > 6 ? Math.ceil(size / 6) : 1;

        let result = "$";
        function generateRGB() {
            return [0, 0, 0].map(() => parseInt(Math.random() * 255));
        }

        function rgbToHex(color) {
            return color.map(e => e.toString(16)).join("");
        }

        for (let i = 0; i < RGB_GENERATIONS; i++) {
            result += rgbToHex(generateRGB());
        }

        return result.substring(0, size + 1);
    }

    return newId;
}

function newElement(element, attribute, attributeValue) {
    const $element = document.createElement(element);

    if (attribute && attributeValue) {
        $element.setAttribute(attribute, attributeValue);
    }

    return $element;
}

function appendChildren($parent, children) {
    if (children && Array.isArray(children)) {
        children.forEach($child => {
            $parent.appendChild($child);
        });

        return $parent;
    }
}

const __id_history__ = [];
const __dictionary_errors__ = {
  "404": "not found...",
  say(error) {
    if(error in this)
      console.error(this[error]);
    else 
      console.error(error);
  }
};

function newElement(element, attribute, attributeValue) {
  const $element = document.createElement(element);

  if (attribute && attributeValue) {
      $element.setAttribute(attribute, attributeValue);
  }

  return $element;
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

function appendChildren($parent, children) {
    if (children && Array.isArray(children)) {
        children.forEach($child => {
            $parent.appendChild($child);
        });

        return $parent;
    }
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

function getDaysOfTheMonth(month, year) {
  if (!month || !year) {
    return;
  }
  
  return new Date(year, month + 1, 0).getDate();
}

export {
  __id_history__,
  __dictionary_errors__,
  randomId,
  newElement,
  appendChildren,
  monthInPT,
  weekDayInPT,
  getDaysOfTheMonth
};
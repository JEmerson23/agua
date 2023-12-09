import {ANCHOR_DAY, residents} from "../main.js";

export default function getDistributionDay(date) {
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
    const _CURRENT_DATE = date;
    const DIFFERENCE_IN_MILLISECONDS = _CURRENT_DATE - ANCHOR_DAY;
    const DIFFERENCE_IN_DAYS =
        DIFFERENCE_IN_MILLISECONDS / (1000 * 60 * 60 * 24);

    return parseInt(DIFFERENCE_IN_DAYS);
  }

  return result + 1;
}


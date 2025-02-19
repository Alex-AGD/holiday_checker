const axios = require("axios");

async function checkHolidays() {
  const year = new Date().getFullYear();
  try {
    const response = await axios.get(
      `https://holidayapi.com/v1/holidays?country=BY&year=${year}&key=${process.env.HOLIDAY_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return null;
  }
}

async function getExchangeRates() {
  try {
    const response = await axios.get(
      "https://www.nbrb.by/api/exrates/rates?periodicity=0"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

async function sendToSlack(message) {
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: message,
    });
  } catch (error) {
    console.error("Error sending to Slack:", error);
  }
}

async function main() {
  const today = new Date().toISOString().split("T")[0];

  const [holidays, rates] = await Promise.all([
    checkHolidays(),
    getExchangeRates(),
  ]);

  let message = `Данные на ${today}\n\n`;

  if (holidays && holidays.holidays) {
    const todayHolidays = holidays.holidays.filter(
      (holiday) => holiday.date === today
    );
    if (todayHolidays.length > 0) {
      message += `Праздники сегодня:\n${todayHolidays
        .map((h) => `- ${h.name}`)
        .join("\n")}\n\n`;
    } else {
      message += "Сегодня праздников нет\n\n";
    }
  }

  if (rates) {
    const mainRates = rates
      .filter((rate) => ["USD", "EUR", "RUB"].includes(rate.Cur_Abbreviation))
      .map((rate) => `${rate.Cur_Abbreviation}: ${rate.Cur_OfficialRate}`)
      .join("\n");
    message += `Курсы валют:\n${mainRates}`;
  }

  await sendToSlack(message);
}

main().catch(console.error);

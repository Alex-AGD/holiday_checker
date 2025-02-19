const axios = require("axios");

async function checkHolidays() {
  const apiKey = process.env.HOLIDAY_API_KEY;
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  try {
    // Проверяем праздники
    const holidayResponse = await axios.get(
      `https://holidayapi.com/v1/holidays?country=BY&year=${year}&month=${month}&day=${day}&key=${apiKey}`
    );

    // Получаем курсы валют
    const ratesResponse = await axios.get(
      "https://api.nbrb.by/exrates/rates?periodicity=0"
    );

    // Формируем сообщение
    let message = "🗓 Ежедневный отчет:\n\n";

    // Добавляем информацию о праздниках
    const holidays = holidayResponse.data.holidays || [];
    if (holidays.length > 0) {
      message += "🎉 Сегодня праздники:\n";
      holidays.forEach((holiday) => {
        message += `- ${holiday.name}\n`;
      });
    } else {
      message += "📅 Сегодня нет праздников\n";
    }

    // Добавляем информацию о курсах валют
    message += "\n💰 Курсы валют:\n";
    const mainCurrencies = ratesResponse.data.filter((rate) =>
      ["USD", "EUR", "RUB"].includes(rate.Cur_Abbreviation)
    );
    mainCurrencies.forEach((currency) => {
      message += `${currency.Cur_Abbreviation}: ${currency.Cur_OfficialRate} BYN\n`;
    });

    // Отправляем в Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, { text: message });
    console.log("Сообщение успешно отправлено в Slack");
  } catch (error) {
    console.error("Ошибка:", error.message);
    throw error;
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

checkHolidays();

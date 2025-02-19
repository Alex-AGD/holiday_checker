const axios = require("axios");

async function checkHolidaysAndRates() {
  const apiKey = process.env.HOLIDAY_API_KEY;
  const currentDate = new Date();
  const year = 2022;
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  try {
    const [holidayResponse, ratesResponse] = await Promise.all([
      axios.get(
        `https://holidayapi.com/v1/holidays?country=BY&year=${year}&month=${month}&day=${day}&key=${apiKey}`
      ),
      axios.get("https://api.nbrb.by/exrates/rates?periodicity=0"),
    ]);

    let message = "🗓 Ежедневный отчет:\n\n";

    const holidays = holidayResponse.data.holidays || [];
    if (holidays.length > 0) {
      message += "🎉 В этот день в прошлом году были праздники:\n";
      holidays.forEach((holiday) => {
        message += `- ${holiday.name}\n`;
      });
    } else {
      message += "📅 В этот день в прошлом году не было праздников\n";
    }

    message += "\n💰 Текущие курсы валют:\n";
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
    if (error.response) {
      console.error("Детали ошибки:", error.response.data);
    }
    throw error;
  }
}
checkHolidaysAndRates().catch((error) => {
  console.error("Критическая ошибка:", error);
  process.exit(1);
});

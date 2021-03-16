export class ScheduleUtil {
  public static getNowFormatDate() {
    const date = new Date();
    const separator = '-';
    const year = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    let month = '';
    let strDate = '';
    if (m >= 1 && m <= 9) {
      month = '0' + m;
    }
    if (d >= 0 && d <= 9) {
      strDate = '0' + strDate;
    }
    let currentDate: string;
    currentDate = year + separator + month + separator + strDate;
    return currentDate;
  }
}

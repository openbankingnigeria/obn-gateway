import moment from "moment";

export const timestampFormatter = (dt: any) => {
  const date = moment(dt).format('ll');
  const time = moment(dt).format('LTS')

  return `${date} @ ${time}`;
}
module.exports = {
  usage: "remind <-f> <-r cron string> <-s phone number> <-l> <-d> <-h hours> <-m minutes> <-s seconds>",
  f: "egg-timer style reminder, if not supplied then will wait until the bot sees you again to send the reminder",
  r: "sets a recurring reminder",
  p: "optional 9-digit phone number to send the reminder via sms. Acts similar to force in that it'll send the reminder at the time instead of waiting for you",
  l: "displays a list of pending reminders",
  d: "deletes a reminder from the list",
  h: "number of hours in the future to send the reminder",
  m: "number of minutes in the future to send the reminder",
  s: "number of seconds in the future to send the reminder",
  example0: "remind -s 1235550123 -h 2 -m 30 get pizza for tonight",
  example1: "remind -f -m 5 tea is ready",
  example2: "remind -r -h 12 -m 30 -p 1235550123 this reminder will be sent at 12:30 every day",
  example3: "remind -l       //lists reminders",
  example4: "remind -d 0     //deletes reminder #0",
}
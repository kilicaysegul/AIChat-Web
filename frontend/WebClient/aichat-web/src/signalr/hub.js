import * as signalR from "@microsoft/signalr";

export function createConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(process.env.REACT_APP_SIGNALR_URL)
    .withAutomaticReconnect()
    .build();
}

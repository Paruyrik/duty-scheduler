// backend/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

type Channels =
  | "add-department"
  | "get-departments"
  | "delete-department"
  | "update-department"
  | "add-sub-department"
  | "get-sub-departments"
  | "add-role"
  | "get-roles"
  | "update-role"
  | "delete-role"
  | "add-employee"
  | "get-employees"
  | "assign-duty"
  | "get-calendar"
  | "generate-schedule"
  | "get-schedule"
  | "export-schedule";

export const api = {
  /**
   * Registers a callback function to be invoked when a message is received on the specified IPC channel.
   *
   * @param {Channels} channel - The name of the IPC channel to listen on.
   * @param {Function} callback - The callback function to be invoked when a message is received.
   *                             The callback function will receive two parameters: the event object and the message data.
   */
  on: (
    channel: Channels,
    callback: (event: IpcRendererEvent, args: unknown) => void
  ) => {
    ipcRenderer.on(channel, (event: IpcRendererEvent, args: unknown) =>
      callback(event, args)
    );
  },

  /**
   * Sends a message through the IPC channel with the specified channel name and arguments.
   *
   * @param {Channels} channel - The name of the IPC channel to send the message through.
   * @param {any} args - The arguments to send along with the message.
   * @return {void} This function does not return anything.
   */
  send: (channel: Channels, args: unknown): void => {
    ipcRenderer.send(channel, args);
  },

  /**
   * Sends a synchronous message through the IPC channel with the specified channel name and arguments.
   *
   * @param {Channels} channel - The name of the IPC channel to send the message through.
   * @param {any} args - The arguments to send along with the message.
   * @return {any} The response from the main process.
   */
  sendSync: (channel: Channels, args: unknown): unknown => {
    return ipcRenderer.sendSync(channel, args);
  },

  invoke: (channel: Channels, args?: unknown): Promise<unknown> => {
    return ipcRenderer.invoke(channel, args);
  },
};

contextBridge.exposeInMainWorld("api", api);

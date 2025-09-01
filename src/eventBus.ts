type Listener = (...args: any[]) => void;
const Listeners : Record<string , Listener[]> = {};
export const EventBus ={
on(eventName: string, listener: Listener) {
    if (!Listeners[eventName]) {
        Listeners[eventName] = [];
    }
    Listeners[eventName].push(listener);
},
emit(eventName: string, ...data: any[]) {
    const listeners = Listeners[eventName];
    if (listeners) {
        listeners.forEach(listener => listener(...data));
    }
}
}
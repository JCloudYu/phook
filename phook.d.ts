declare type PHookConfig = {
	/** Whether to suppress logs of unhandled errors. It is set to false by default. **/
	silent?:boolean,

	durations?:{
		/** Durations before exiting when receiving ANY signals **/
		SIGNAL?:number,

		/** Durations before exiting when receiving SIGINT signal **/
		SIGINT?:number,

		/** Durations before exiting when receiving SIGTERM signal **/
		SIGTERM?:number,

		/** Durations before exiting when receiving SIGQUIT signal **/
		SIGQUIT?:number,

		/** Durations before exiting when receiving unhandled errors **/
		UNHANDLED_ERROR?:number
	}
};

declare class phook {
	/** 
	 * Config prcess hook's behaviors such 
	 * as duration before exiting when program 
	 * receives unhandled errors or signals
	**/
	static configure(config?:PHookConfig):phook;
}

declare global {
	namespace NodeJS {
		interface Process {
			/** An alias to Process.on call which also accepts and resolve Promises **/
			hook(event:string, callback:Function):Process;
	
			/** An alias to Process.off call which also accepts and resolve Promises **/
			unhook(event:string, callback:Function):Process;
		}
	}
}


export = phook;
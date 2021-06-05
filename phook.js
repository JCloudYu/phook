(()=>{
	"use strict";

	const PROCESS_EXIT = process.exit.bind(process);
	const SIGNAL = {
		SIGHUP:   0,
		SIGINT:   2,
		SIGQUIT:  3,
		SIGTERM: 15
	}
	const STATE = {
		VERBOSE: true,
		UNHANDLED_ERROR: -1,
		SIGINT:  100,
		SIGTERM: 100,
		SIGQUIT: 100,
		HOOK_GROUP: new Map()
	};

	

	
	process.hook = function(event, callback) {
		if ( typeof callback !== "function" ) {
			throw new TypeError("Given hook callback must be a function!");
		}

		event = (''+(event||''));
		let hook_list = STATE.HOOK_GROUP.get(event);
		if ( !Array.isArray(hook_list) ) {
			STATE.HOOK_GROUP.set(event, hook_list=[]);
			if ( event !== "exit" ) {
				process.on(event, TriggerHook.bind(process, event));
			}
		}
		
		hook_list.push(callback);

		return this;
	};
	process.unhook = function(event, callback=undefined) {
		event = (''+(event||''));
		let hook_list = STATE.HOOK_GROUP.get(event);
		if ( !hook_list ) return;


		if ( arguments.length > 1 ) {
			const index = hook_list.indexOf(callback);
			if ( index < 0 ) return;
			hook_list.splice(index, 1);
		}
		else {
			hook_list.splice(0, hook_list.length);
		}

		return this;
	};
	process.exit = function(exit_code=0) {
		Promise.resolve().then(TriggerHook.bind(process, 'exit', exit_code))
		.catch((e)=>{
			console.error("Unexpected error when calling termination")
			console.error(e);
		})
		.finally(()=>PROCESS_EXIT(exit_code));
	};



	process
	.on('SIGHUP', ()=>{}).on('SIGUSR1', ()=>{}).on('SIGUSR2', ()=>{})
	.on('uncaughtException', (e)=>{
		if ( STATE.VERBOSE ) {
			console.error("Received uncaught exception!");
			console.error(e);
		}
	
		if ( STATE.UNHANDLED_ERROR < 0 ) return;
		setTimeout(()=>PROCESS_EXIT(1), STATE.UNHANDLED_ERROR);
	})
	.on('unhandledRejection', (e)=>{
		if ( STATE.VERBOSE ) {
			console.error("Received unhandled rejection!");
			console.error(e);
		}
		
		if ( STATE.UNHANDLED_ERROR < 0 ) return;
		setTimeout(()=>PROCESS_EXIT(1), STATE.UNHANDLED_ERROR);
	})
	.on('SIGINT', ()=>{
		if ( STATE.SIGINT < 0 ) return;
		setTimeout(()=>process.exit(128+SIGNAL.SIGINT), STATE.SIGINT);
	})
	.on('SIGTERM', ()=>{
		if ( STATE.SIGTERM < 0 ) return;
		setTimeout(()=>process.exit(128+SIGNAL.SIGTERM), STATE.SIGTERM);
	})
	.on('SIGQUIT', ()=>{
		if ( STATE.SIGQUIT < 0 ) return;
		setTimeout(()=>process.exit(128+SIGNAL.SIGQUIT), STATE.SIGQUIT);
	});

	

	Object.defineProperties(module.exports, {
		configure: {
			configurable:false, enumerable:true, writable:false,
			value:function(options={silent:false, durations:{SIGNAL:0, SIGINT:0, SIGTERM:0, SIGQUIT:0, UNHANDLED_ERROR:-1}}) {
				if ( Object(options) !== options ) {
					throw new TypeError("Configuration options must be an object!");
				}
				
				
				// WARN: Legacy options ( these options' names are too long to memorize... )
				if ( options.SIGNAL_DURATION !== undefined ) {
					STATE.SIGINT = STATE.SIGTERM = STATE.SIGQUIT = options.SIGNAL_DURATION|0;
				}
				
				if ( options.SIGINT_DURATION !== undefined ) {
					STATE.SIGINT = options.SIGINT_DURATION|0;
				}

				if ( options.SIGTERM_DURATION !== undefined ) {
					STATE.SIGTERM = options.SIGTERM_DURATION|0;
				}

				if ( options.SIGQUIT_DURATION !== undefined ) {
					STATE.SIGQUIT = options.SIGQUIT_DURATION|0;
				}

				if ( options.UNHANDLED_ERROR_DURATION !== undefined ) {
					STATE.UNHANDLED_ERROR = options.UNHANDLED_ERROR_DURATION|0;
				}
				
				
				
				
				STATE.VERBOSE = !options.silent;
				
				if ( Object(options.durations) === options.durations ) {
					const {durations} = options;
					if ( durations.SIGNAL !== undefined ) {
						STATE.SIGINT = STATE.SIGTERM = STATE.SIGQUIT = durations.SIGNAL|0;
					}
					
					if ( durations.SIGINT !== undefined ) {
						STATE.SIGINT = durations.SIGINT|0;
					}
	
					if ( durations.SIGTERM !== undefined ) {
						STATE.SIGTERM = durations.SIGTERM|0;
					}
	
					if ( durations.SIGQUIT !== undefined ) {
						STATE.SIGQUIT = durations.SIGQUIT|0;
					}
	
					if ( durations.UNHANDLED_ERROR !== undefined ) {
						STATE.UNHANDLED_ERROR = durations.UNHANDLED_ERROR|0;
					}
				}
			}
		}
	});



	async function TriggerHook(hook_name, ...args) {
		const hook_list = STATE.HOOK_GROUP.get(hook_name);
		if ( !hook_list ) return;

		for(const hook of hook_list) {
			await hook(...args);
		}
	}
})();

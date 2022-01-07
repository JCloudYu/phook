# Process Hook (PHook) #
This library is designed to allow developers to hook clear handlers before the process exits.

## Install ##
Run the following command
```bash
npm install phook
```

## APIs ##
### phook.configure ##
Allow developers to modify the phook's default behaviors

```javascript
phook.configure({
	// True prevents the system from showing error logs
	silent: false,

	durations: {
		// Duration before exit when system receives SIGINT
		// Set to negative value to stop quiting
		SIGINT: 100,

		// Duration before exit when receiving SIGTERM
		// Set to negative value to stop quiting
		SIGTERM: 100,

		// Duration before exit when receiving SIGQUIT
		// Set to negative value to stop quiting
		SIGQUIT: 100,

		// Duration before exit when receiving any unhandled error
		// Set to negative value to stop quiting
		UNHANDLED_ERROR: 100
	}
})
```
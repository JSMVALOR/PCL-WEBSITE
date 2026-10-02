import { registerPlugin } from "./@capacitor_core.js";
//#region Frontend/node_modules/@capgo/capacitor-updater/dist/esm/history.js
var KEEP_FLAG_KEY = "__capgo_keep_url_path_after_reload";
var HISTORY_STORAGE_KEY = "__capgo_history_stack__";
var MAX_STACK_ENTRIES = 100;
if (typeof window !== "undefined" && typeof document !== "undefined" && typeof history !== "undefined") {
	const win = window;
	if (!win.__capgoHistoryPatched) {
		win.__capgoHistoryPatched = true;
		const isFeatureConfigured = () => {
			try {
				if (win.__capgoKeepUrlPathAfterReload) return true;
			} catch (err) {}
			try {
				return window.localStorage.getItem(KEEP_FLAG_KEY) === "1";
			} catch (err) {
				return false;
			}
		};
		const readStored = () => {
			try {
				const raw = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
				if (!raw) return {
					stack: [],
					index: -1
				};
				const parsed = JSON.parse(raw);
				if (!parsed || !Array.isArray(parsed.stack) || typeof parsed.index !== "number") return {
					stack: [],
					index: -1
				};
				return parsed;
			} catch (err) {
				return {
					stack: [],
					index: -1
				};
			}
		};
		const writeStored = (stack, index) => {
			try {
				window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({
					stack,
					index
				}));
			} catch (err) {}
		};
		const clearStored = () => {
			try {
				window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
			} catch (err) {}
		};
		const normalize = (url) => {
			try {
				const base = url !== null && url !== void 0 ? url : window.location.href;
				const parsed = new URL(base instanceof URL ? base.toString() : base, window.location.href);
				return `${parsed.pathname}${parsed.search}${parsed.hash}`;
			} catch (err) {
				return null;
			}
		};
		const trimStack = (stack, index) => {
			if (stack.length <= MAX_STACK_ENTRIES) return {
				stack,
				index
			};
			const start = stack.length - MAX_STACK_ENTRIES;
			return {
				stack: stack.slice(start),
				index: Math.max(0, index - start)
			};
		};
		const runWhenReady = (fn) => {
			if (document.readyState === "complete" || document.readyState === "interactive") fn();
			else window.addEventListener("DOMContentLoaded", fn, { once: true });
		};
		let featureActive = false;
		let isRestoring = false;
		let restoreScheduled = false;
		const ensureCurrentTracked = () => {
			if (!featureActive) return;
			const stored = readStored();
			const current = normalize();
			if (!current) return;
			if (stored.stack.length === 0) {
				stored.stack.push(current);
				stored.index = 0;
				writeStored(stored.stack, stored.index);
				return;
			}
			if (stored.index < 0 || stored.index >= stored.stack.length) stored.index = stored.stack.length - 1;
			if (stored.stack[stored.index] !== current) {
				stored.stack[stored.index] = current;
				writeStored(stored.stack, stored.index);
			}
		};
		const record = (url, replace) => {
			if (!featureActive || isRestoring) return;
			const normalized = normalize(url);
			if (!normalized) return;
			let { stack, index } = readStored();
			if (stack.length === 0) {
				stack.push(normalized);
				index = stack.length - 1;
			} else if (replace) {
				if (index < 0 || index >= stack.length) index = stack.length - 1;
				stack[index] = normalized;
			} else if (index >= stack.length - 1) {
				stack.push(normalized);
				index = stack.length - 1;
			} else {
				stack = stack.slice(0, index + 1);
				stack.push(normalized);
				index = stack.length - 1;
			}
			({stack, index} = trimStack(stack, index));
			writeStored(stack, index);
		};
		const restoreHistory = () => {
			if (!featureActive || isRestoring) return;
			const stored = readStored();
			if (stored.stack.length === 0) {
				ensureCurrentTracked();
				return;
			}
			const targetIndex = stored.index >= 0 && stored.index < stored.stack.length ? stored.index : stored.stack.length - 1;
			const normalizedCurrent = normalize();
			if (stored.stack.length === 1 && normalizedCurrent === stored.stack[0]) return;
			const firstEntry = stored.stack[0];
			if (!firstEntry) return;
			isRestoring = true;
			try {
				history.replaceState(history.state, document.title, firstEntry);
				for (let i = 1; i < stored.stack.length; i += 1) history.pushState(history.state, document.title, stored.stack[i]);
			} catch (err) {
				isRestoring = false;
				return;
			}
			isRestoring = false;
			const offset = targetIndex - (stored.stack.length - 1);
			if (offset !== 0) history.go(offset);
			else {
				history.replaceState(history.state, document.title, stored.stack[targetIndex]);
				window.dispatchEvent(new PopStateEvent("popstate"));
			}
		};
		const scheduleRestore = () => {
			if (!featureActive || restoreScheduled) return;
			restoreScheduled = true;
			runWhenReady(() => {
				restoreScheduled = false;
				restoreHistory();
			});
		};
		let originalPushState = null;
		let originalReplaceState = null;
		const popstateHandler = () => {
			if (!featureActive || isRestoring) return;
			const normalized = normalize();
			if (!normalized) return;
			const stored = readStored();
			const idx = stored.stack.lastIndexOf(normalized);
			if (idx >= 0) stored.index = idx;
			else {
				stored.stack.push(normalized);
				stored.index = stored.stack.length - 1;
			}
			const trimmed = trimStack(stored.stack, stored.index);
			writeStored(trimmed.stack, trimmed.index);
		};
		const patchHistory = () => {
			if (originalPushState && originalReplaceState) return;
			originalPushState = history.pushState;
			originalReplaceState = history.replaceState;
			history.pushState = function pushStatePatched(state, title, url) {
				const result = originalPushState === null || originalPushState === void 0 ? void 0 : originalPushState.call(history, state, title, url);
				record(url, false);
				return result;
			};
			history.replaceState = function replaceStatePatched(state, title, url) {
				const result = originalReplaceState === null || originalReplaceState === void 0 ? void 0 : originalReplaceState.call(history, state, title, url);
				record(url, true);
				return result;
			};
			window.addEventListener("popstate", popstateHandler);
		};
		const unpatchHistory = () => {
			if (originalPushState) {
				history.pushState = originalPushState;
				originalPushState = null;
			}
			if (originalReplaceState) {
				history.replaceState = originalReplaceState;
				originalReplaceState = null;
			}
			window.removeEventListener("popstate", popstateHandler);
		};
		const setFeatureActive = (enabled) => {
			if (featureActive === enabled) {
				if (featureActive) {
					ensureCurrentTracked();
					scheduleRestore();
				}
				return;
			}
			featureActive = enabled;
			if (featureActive) {
				patchHistory();
				ensureCurrentTracked();
				scheduleRestore();
			} else {
				unpatchHistory();
				clearStored();
			}
		};
		window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload", (event) => {
			var _a;
			const evt = event;
			const enabled = (_a = evt === null || evt === void 0 ? void 0 : evt.detail) === null || _a === void 0 ? void 0 : _a.enabled;
			if (typeof enabled === "boolean") {
				win.__capgoKeepUrlPathAfterReload = enabled;
				setFeatureActive(enabled);
			} else {
				win.__capgoKeepUrlPathAfterReload = true;
				setFeatureActive(true);
			}
		});
		setFeatureActive(isFeatureConfigured());
	}
}
//#endregion
//#region Frontend/node_modules/@capgo/capacitor-updater/dist/esm/definitions.js
/**
* Update availability status.
*
* @since 8.0.0
*/
var AppUpdateAvailability;
(function(AppUpdateAvailability) {
	/**
	* Update availability is unknown.
	* This typically means the check hasn't completed or failed.
	*/
	AppUpdateAvailability[AppUpdateAvailability["UNKNOWN"] = 0] = "UNKNOWN";
	/**
	* No update is available.
	* The installed version is the latest.
	*/
	AppUpdateAvailability[AppUpdateAvailability["UPDATE_NOT_AVAILABLE"] = 1] = "UPDATE_NOT_AVAILABLE";
	/**
	* An update is available for download.
	*/
	AppUpdateAvailability[AppUpdateAvailability["UPDATE_AVAILABLE"] = 2] = "UPDATE_AVAILABLE";
	/**
	* An update is currently being downloaded or installed.
	*/
	AppUpdateAvailability[AppUpdateAvailability["UPDATE_IN_PROGRESS"] = 3] = "UPDATE_IN_PROGRESS";
})(AppUpdateAvailability || (AppUpdateAvailability = {}));
/**
* Installation status for flexible updates (Android only).
*
* @since 8.0.0
*/
var FlexibleUpdateInstallStatus;
(function(FlexibleUpdateInstallStatus) {
	/**
	* Unknown install status.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["UNKNOWN"] = 0] = "UNKNOWN";
	/**
	* Download is pending and will start soon.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["PENDING"] = 1] = "PENDING";
	/**
	* Download is in progress.
	* Check `bytesDownloaded` and `totalBytesToDownload` for progress.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["DOWNLOADING"] = 2] = "DOWNLOADING";
	/**
	* The update is being installed.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["INSTALLING"] = 3] = "INSTALLING";
	/**
	* The update has been installed.
	* The app needs to be restarted to use the new version.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["INSTALLED"] = 4] = "INSTALLED";
	/**
	* The update failed to download or install.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["FAILED"] = 5] = "FAILED";
	/**
	* The update was canceled by the user.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["CANCELED"] = 6] = "CANCELED";
	/**
	* The update has been downloaded and is ready to install.
	* Call {@link CapacitorUpdaterPlugin.completeFlexibleUpdate} to install.
	*/
	FlexibleUpdateInstallStatus[FlexibleUpdateInstallStatus["DOWNLOADED"] = 11] = "DOWNLOADED";
})(FlexibleUpdateInstallStatus || (FlexibleUpdateInstallStatus = {}));
/**
* Result codes for app update operations.
*
* @since 8.0.0
*/
var AppUpdateResultCode;
(function(AppUpdateResultCode) {
	/**
	* The update completed successfully.
	*/
	AppUpdateResultCode[AppUpdateResultCode["OK"] = 0] = "OK";
	/**
	* The user canceled the update.
	*/
	AppUpdateResultCode[AppUpdateResultCode["CANCELED"] = 1] = "CANCELED";
	/**
	* The update failed.
	*/
	AppUpdateResultCode[AppUpdateResultCode["FAILED"] = 2] = "FAILED";
	/**
	* No update is available.
	*/
	AppUpdateResultCode[AppUpdateResultCode["NOT_AVAILABLE"] = 3] = "NOT_AVAILABLE";
	/**
	* The requested update type is not allowed.
	* For example, trying to perform an immediate update when only flexible is allowed.
	*/
	AppUpdateResultCode[AppUpdateResultCode["NOT_ALLOWED"] = 4] = "NOT_ALLOWED";
	/**
	* Required information is missing.
	* This can happen if {@link CapacitorUpdaterPlugin.getAppUpdateInfo} wasn't called first.
	*/
	AppUpdateResultCode[AppUpdateResultCode["INFO_MISSING"] = 5] = "INFO_MISSING";
})(AppUpdateResultCode || (AppUpdateResultCode = {}));
//#endregion
//#region Frontend/node_modules/@capgo/capacitor-updater/dist/esm/index.js
var CapacitorUpdater = registerPlugin("CapacitorUpdater", { web: () => import("./web-f61S6o3G.js").then((m) => new m.CapacitorUpdaterWeb()) });
//#endregion
export { AppUpdateAvailability, AppUpdateResultCode, CapacitorUpdater, FlexibleUpdateInstallStatus };

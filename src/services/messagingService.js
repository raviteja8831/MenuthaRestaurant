import { AlertService } from "../contexts/AlertContext";

/**
 * Show a generic error message
 * @param {string} message - The error message to display
 * @param {string} title - The title for the error (default: "Error")
 */
export function showError(message, title = "Error") {
  AlertService.error(message, title);
}

/**
 * Show an API error - handles both error objects and (title, message) pairs
 * @param {Object|string} errorOrTitle - Either an error object or a title string
 * @param {string} messageOrUndefined - Optional message (used when first param is title)
 */
export function showApiError(errorOrTitle, messageOrUndefined) {
  // Handle case: showApiError("Title", "Message")
  if (typeof errorOrTitle === 'string' && typeof messageOrUndefined === 'string') {
    AlertService.error(messageOrUndefined, errorOrTitle);
    return;
  }

  // Handle case: showApiError(errorObject)
  const error = errorOrTitle;
  console.log("API Error (full):", error);

  let msg = 'Something went wrong';
  let title = 'Error';

  if (error?.response?.data) {
    if (typeof error.response.data === 'string') {
      msg = error.response.data;
    } else if (error.response.data.message) {
      msg = error.response.data.message;
    } else {
      msg = JSON.stringify(error.response.data);
    }
  } else if (error?.message) {
    msg = error.message;
  } else if (typeof error === 'string') {
    msg = error;
  }

  AlertService.error(msg, title);
}

/**
 * Show a success message
 * @param {string} message - The success message to display
 * @param {string} title - The title for the success (default: "Success")
 */
export function showSuccess(message, title = "Success") {
  AlertService.success(message, title);
}

/**
 * Show a warning message
 * @param {string} message - The warning message to display
 * @param {string} title - The title for the warning (default: "Warning")
 */
export function showWarning(message, title = "Warning") {
  AlertService.warning(message, title);
}

/**
 * Show an info message
 * @param {string} message - The info message to display
 * @param {string} title - The title for the info (default: "Info")
 */
export function showInfo(message, title = "Info") {
  AlertService.info(message, title);
}

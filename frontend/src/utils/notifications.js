import { toast } from "react-toastify";

export const notify = {
  success: (message) => toast.success(message, { className: "toast-success" }),
  error: (message) => toast.error(message, { className: "toast-error" }),
  info: (message) => toast.info(message, { className: "toast-info" }),
  warning: (message) => toast.warning(message, { className: "toast-warning" }),
  loading: (message) => toast.loading(message, { className: "toast-loading" }),
};

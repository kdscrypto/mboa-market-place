
import { useResetPasswordSession } from "./useResetPasswordSession";
import { useResetPasswordSubmit } from "./useResetPasswordSubmit";

export const useResetPasswordForm = () => {
  const { isReady, isChecking } = useResetPasswordSession();
  const { handleResetPassword, isLoading, isSuccess } = useResetPasswordSubmit();

  return { 
    handleResetPassword, 
    isLoading, 
    isSuccess, 
    isReady,
    isChecking
  };
};

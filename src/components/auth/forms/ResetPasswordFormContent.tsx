
import React from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordFormValues } from "../validation/authSchemas";
import PasswordField from "../components/PasswordField";
import { Input } from "@/components/ui/input";

interface ResetPasswordFormContentProps {
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

const ResetPasswordFormContent: React.FC<ResetPasswordFormContentProps> = ({ 
  onSubmit, 
  isLoading 
}) => {
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <PasswordField
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Nouveau mot de passe"
                    name="password"
                    error={form.formState.errors.password?.message}
                    showStrengthIndicator={true}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-mboa-orange hover:bg-mboa-orange/90"
            disabled={isLoading}
          >
            {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default ResetPasswordFormContent;

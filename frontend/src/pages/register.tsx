import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppDispatch, RootState } from '../store';
import { register, reset } from '../store/userSlice';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { role } = router.query; // Get role from query param

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();

  const { isLoading, isSuccess, isError, message } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Redirect to dashboard on successful registration
    if (isSuccess) {
      router.push('/dashboard');
    }
    if (isError) {
      // You can use a toast to show the error message
      console.error(message);
    }
    // Reset the status flags on component unmount or when isSuccess/isError changes
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError, message, router, dispatch]);

  const onSubmit = (data: any) => {
    // Add the role to the form data before dispatching
    const userData = { ...data, role };
    dispatch(register(userData));
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Your {role} Account</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="ml-4">Creating account...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...formRegister('email', { required: 'Email is required' })} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                </div>
                <div className="mb-6">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...formRegister('password', { required: 'Password is required' })} />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Create Account
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
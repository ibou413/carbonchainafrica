import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AppDispatch, RootState } from '../store';
import { login, reset } from '../store/userSlice';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { register: formRegister, handleSubmit, formState: { errors } } = useForm();

  const { currentUser, isLoading, isSuccess, isError, message } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log('Login Page State:', { isSuccess, currentUser, isError, message });
    // Redirect to dashboard on successful login
    if (isSuccess && currentUser) {
      router.push('/dashboard');
    }
    if (isError) {
      // You can use a toast to show the error message
      console.error(message);
    }
    // Reset the status flags on component unmount
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, currentUser, isError, message, router, dispatch]);

  const onSubmit = (data: any) => {
    dispatch(login(data));
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="min-h-screen flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p>Don't have an account? <Link href="/select-role" className="text-blue-600 hover:underline">Sign up</Link></p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
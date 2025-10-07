'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { doc, setDoc } from 'firebase/firestore';

interface SignupFormProps {
    onLoginClick: () => void;
    onSignupSuccess: () => void;
}

export default function SignupForm({ onLoginClick, onSignupSuccess }: SignupFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile in Firebase Auth
      await updateProfile(user, { displayName });

      // Create a document in the 'users' collection in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName,
        email,
        id: user.uid,
      }, { merge: true });
      
      toast({ title: 'Account created successfully!' });
      onSignupSuccess();
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">Create an account</DialogTitle>
        <DialogDescription className="text-center">
          Enter your details below to get started.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSignup} className="mt-4">
        <CardContent className="grid gap-4 p-0">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 p-0 mt-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={onLoginClick}
              className="p-0 h-auto"
            >
              Log in
            </Button>
          </div>
        </CardFooter>
      </form>
    </>
  );
}

"use client"
import Logo from '../../../assets/logo-teologia-2.svg'
import Image from 'next/image';
import React, { useState } from 'react';
import { signIn, } from "next-auth/react";
import Loader from '../ui/loading';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const LoginForm = () => {
    const route = useRouter()
    const [loading, setLoading] = useState<boolean>(false);
    const pathname = useSearchParams()
    const isRegister = pathname.get("Register")
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        const singin = await signIn("google", { redirectTo: "/questionario", redirect: false })
        if (singin.ok) {
            return window.location.href = singin.url as string
        }
        if (singin?.error) {
            switch (singin.error) {
                case "OAuthAccountNotLinked":
                    alert("Essa conta já está vinculada a outro método de login.")
                    break
                case "OAuthCallback":
                    alert("Erro ao finalizar o login com Google. Tente novamente.")
                    break
                case "OAuthSignin":
                    alert("Erro ao iniciar o login com Google.")
                    break
                case "Configuration":
                    alert("Erro de configuração do login. Contate o suporte.")
                    break
                default:
                    alert("Erro desconhecido ao tentar login com Google.")
            }
            console.error("Erro de login:", singin.error)
        }
    };
    return (
        <div className="min-h-screen  flex flex-col">
            <div className="container mx-auto px-4 py-6">
                <Link href={"/"}>
                    <Image src={Logo} alt='logo' />
                </Link>

                <div className=" flex flex-col items-center justify-center mt-20">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-3 sm:p-4 animate-fade-in">
                        <div className="text-center mb-8">
                            <h1 className="md:text-3xl text-xl font-bold mb-2 text-gray-800">Bem-vindo ao Teolog-IA</h1>
                            <p className="text-gray-500 md:text-base text-sm text-center md:px-4">Faça {isRegister ? "registro" : "login"} para acessar explicações bíblicas contextualizadas, fundamentadas em sua tradição teológica.</p>
                        </div>

                        {loading ? <>
                            <Loader />
                        </> : <button
                            onClick={handleSubmit}
                            className="cursor-pointer border border-zinc-300 mx-auto text-black flex gap-2 items-center bg-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-300 transition-all ease-in duration-200"
                        >
                            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-6">
                                <path
                                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                                    fill="#FFC107"
                                ></path>
                                <path
                                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                                    fill="#FF3D00"
                                ></path>
                                <path
                                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                                    fill="#4CAF50"
                                ></path>
                                <path
                                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                                    fill="#1976D2"
                                ></path>
                            </svg>
                            {isRegister ? "Registrar" : "Entrar"} com Google
                        </button>
                        }

                    </div>

                    <div className="mt-8 text-sm text-center text-gray-500">
                        © 2025 TEOLOG.IA - Todos os direitos reservados
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
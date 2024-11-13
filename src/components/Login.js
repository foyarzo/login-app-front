import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondo from './assets/img/bg-3.jpg';
import logo from './assets/img/logo.png';
import IndicadorCarga from './IndicadorCarga'; // Asegúrate de tener este componente de carga

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://0081-191-116-185-233.ngrok-free.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.access_token); // Guarda el token JWT
        navigate('/index'); // Redirige a la vista Index después de autenticar
      } else {
        setError(data.message || 'Error de autenticación');
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${fondo})`,
      }}
    >
      <div
        className="rounded-xl px-16 py-10 shadow-lg backdrop-blur-md max-sm:px-8"
        style={{ backgroundColor: '#fff', opacity: 0.9 }}
      >
        <div className="text-gray-700">
          <div className="mb-8 flex flex-col items-center">
            <img src={logo} width="150" alt="Logo" />
            <span className="text-gray-500 mt-4">Inicie sesión</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 text-lg">
              <input
                className="rounded-3xl border-none bg-[#3BAF29] bg-opacity-50 px-6 py-2 text-center text-white placeholder-white shadow-lg outline-none backdrop-blur-md"
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 text-lg">
              <input
                className="rounded-3xl border-none bg-[#3BAF29] bg-opacity-50 px-6 py-2 text-center text-white placeholder-white shadow-lg outline-none backdrop-blur-md"
                type="password"
                name="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="mt-8 flex justify-center text-lg text-black">
              <button
                type="submit"
                disabled={isLoading}
                className={`rounded-3xl bg-[#3BAF29] bg-opacity-50 px-10 py-2 text-white shadow-xl backdrop-blur-md transition-colors duration-300 ${
                  isLoading
                    ? 'cursor-not-allowed opacity-70'
                    : 'hover:bg-[#3BAF29] hover:bg-opacity-80'
                }`}
              >
                {isLoading ? <IndicadorCarga /> : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

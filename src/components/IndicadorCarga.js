import React from 'react';

const IndicadorCarga = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      <span className="ml-2 text-green-600">Cargando...</span>
    </div>
  );
};

export default IndicadorCarga;

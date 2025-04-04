'use client';

import { useState } from 'react';

export default function TestWebhook() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Example lawyer firm data
  const exampleData = {
    slug: "romero-legal",
    nombre_estudio: "Romero Legal",
    ubicaciones: ["Granada", "Jaén"],
    areas_practica: [
      {
        nombre: "Derecho Fiscal",
        tipos_casos: ["Impuestos", "Inspecciones", "Planificación Fiscal"]
      },
      {
        nombre: "Derecho Internacional",
        tipos_casos: ["Contratos Internacionales", "Inversiones Extranjeras"]
      }
    ],
    resumen: "Romero Legal es un bufete especializado en derecho fiscal e internacional con enfoque en empresas con actividad transfronteriza.",
    valores: ["Globalidad", "Precisión", "Innovación", "Proactividad"],
    contacto: {
      telefono: "+34 958 123 456",
      email: "contacto@romerolegal.es",
      direccion: "Gran Vía 23, 18001 Granada"
    }
  };
  
  const handleTestWebhook = async () => {
    setLoading(true);
    try {
      // Changed from '/api/webhook' to '/.netlify/functions/webhook'
      const response = await fetch('/.netlify/functions/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exampleData),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Probar Webhook</h1>
      
      <div className="mb-6">
        <button
          onClick={handleTestWebhook}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Datos de Ejemplo'}
        </button>
      </div>
      
      {result && (
        <div className="border p-4 rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          <pre className="bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
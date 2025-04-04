import fs from 'fs';
import path from 'path';
import Link from 'next/link';

// Define la interfaz para los datos del bufete
interface LawyerFirm {
  slug: string;
  nombre_estudio: string;
}

// Función para obtener los datos de todos los bufetes
async function getLawyerFirms(): Promise<LawyerFirm[]> {
  const directory = path.join(process.cwd(), 'data/lawyers');
  
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    return [];
  }
  
  const filenames = fs.readdirSync(directory);
  
  const lawyerFirms = filenames
    .filter(filename => filename.endsWith('.json'))
    .map(filename => {
      const filePath = path.join(directory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      try {
        const data = JSON.parse(fileContents);
        return {
          slug: data.slug,
          nombre_estudio: data.nombre_estudio
        };
      } catch (e) {
        console.error(`Error parsing JSON file ${filename}:`, e);
        return null;
      }
    })
    .filter(Boolean) as LawyerFirm[];
  
  return lawyerFirms;
}

// Generate static data at build time
export async function generateStaticParams() {
  const lawyerFirms = await getLawyerFirms();
  return lawyerFirms.map(firm => ({
    slug: firm.slug,
  }));
}

export default async function Home() {
  // Obtener los datos de forma dinámica
  const lawyerFirms = await getLawyerFirms();
  
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ConectaAbogados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lawyerFirms.length > 0 ? (
          lawyerFirms.map((firm) => (
            <div key={firm.slug} className="border rounded-md p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{firm.nombre_estudio}</h2>
              <Link 
                href={`/bufete/${firm.slug}/`}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Ver perfil
              </Link>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-center py-8 text-gray-500">
            No hay bufetes disponibles actualmente. Añada archivos JSON a la carpeta data/lawyers.
          </p>
        )}
      </div>
    </main>
  );
}
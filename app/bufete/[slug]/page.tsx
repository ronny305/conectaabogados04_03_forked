import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Define interfaces for the lawyer firm data
interface ContactInfo {
  telefono: string;
  email: string;
  direccion: string;
}

interface PracticeArea {
  nombre: string;
  tipos_casos: string[];
}

interface LawyerFirm {
  slug: string;
  nombre_estudio: string;
  ubicaciones: string[];
  areas_practica: PracticeArea[];
  resumen: string;
  valores: string[];
  contacto: ContactInfo;
}

// Function to get all lawyer firm slugs for static paths
async function getLawyerFirmSlugs() {
  const directory = path.join(process.cwd(), 'data/lawyers');
  
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    return [];
  }
  
  const filenames = fs.readdirSync(directory);
  
  return filenames
    .filter(filename => filename.endsWith('.json'))
    .map(filename => {
      try {
        const fileContents = fs.readFileSync(path.join(directory, filename), 'utf8');
        const data = JSON.parse(fileContents);
        return data.slug;
      } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        return null;
      }
    })
    .filter(Boolean);
}

// Function to get lawyer firm data by slug
async function getLawyerFirmBySlug(slug: string): Promise<LawyerFirm | null> {
  const directory = path.join(process.cwd(), 'data/lawyers');
  
  if (!fs.existsSync(directory)) {
    return null;
  }
  
  const filenames = fs.readdirSync(directory)
    .filter(filename => filename.endsWith('.json'));
  
  for (const filename of filenames) {
    const filePath = path.join(directory, filename);
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContents);
      
      if (data.slug === slug) {
        return data as LawyerFirm;
      }
    } catch (error) {
      console.error(`Error processing file ${filename}:`, error);
    }
  }
  
  return null;
}

// Generate static paths
export async function generateStaticParams() {
  const slugs = await getLawyerFirmSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const firmData = await getLawyerFirmBySlug(slug);
  
  if (!firmData) {
    notFound();
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Volver a la lista
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">{firmData.nombre_estudio}</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ubicaciones</h2>
        <ul className="list-disc pl-6">
          {firmData.ubicaciones.map((ubicacion, index) => (
            <li key={index}>{ubicacion}</li>
          ))}
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Áreas de Práctica</h2>
        {firmData.areas_practica.map((area, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-medium">{area.nombre}</h3>
            <p className="text-sm text-gray-600 mt-1">Tipos de casos:</p>
            <ul className="list-disc pl-6">
              {area.tipos_casos.map((caso, cIndex) => (
                <li key={cIndex}>{caso}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Resumen</h2>
        <p>{firmData.resumen}</p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Valores</h2>
        <ul className="list-disc pl-6">
          {firmData.valores.map((valor, index) => (
            <li key={index}>{valor}</li>
          ))}
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Contacto</h2>
        <div>
          <p>Teléfono: {firmData.contacto.telefono}</p>
          <p>Email: {firmData.contacto.email}</p>
          <p>Dirección: {firmData.contacto.direccion}</p>
        </div>
      </section>
    </div>
  );
}
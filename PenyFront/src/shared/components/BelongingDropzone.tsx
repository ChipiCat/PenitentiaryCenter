import { useState } from 'react';
import { Group, Text, Avatar } from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconFingerprint } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';

const ACCEPTED_MIME_IMAGE = ['image/jpeg', 'image/png'];
const ACCEPTED_MIME_FILE = ['image/jpeg', 'image/png', 'application/pdf'];

export function ProfilePhotoDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <Dropzone
      onDrop={(files) => {
        const file = files[0];
        if (file && file.size > 10 * 1024 * 1024) {
          alert('El archivo supera el tamaño máximo de 10MB.');
          return;
        }
        setPreview(URL.createObjectURL(file));
        onFile(file);
      }}
      onReject={() => alert('Archivo no permitido o demasiado grande')}
      maxSize={10 * 1024 * 1024}
      accept={ACCEPTED_MIME_IMAGE}
      style={{
        border: '1px dashed #ced4da',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0',
        width: 140,
        height: 140,
        minWidth: 140,
        minHeight: 140,
        maxWidth: 140,
        maxHeight: 140,
        overflow: 'hidden',
      }}
    >
      <Group justify="center" gap="sm" style={{ pointerEvents: 'none', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', height: '100%', minHeight: 0 }}>
        {preview ? (
          <Avatar src={preview} radius={70} size={100} />
        ) : (
          <Dropzone.Idle>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <IconPhoto size={32} color="var(--mantine-color-dimmed)" stroke={1.5} />
              <Text size="sm" inline mt={7}>
                Foto de perfil
              </Text>
              <Text size="xs" c="dimmed" inline mt={10}>
                Solo imágenes (.jpeg, .png) hasta 10MB
              </Text>
            </div>
          </Dropzone.Idle>
        )}
      </Group>
    </Dropzone>
  );
}

export function FingerprintDropzone({ label, onFile }: { label: string; onFile: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <Dropzone
      onDrop={(files) => {
        const file = files[0];
        if (file && file.size > 10 * 1024 * 1024) {
          alert('El archivo supera el tamaño máximo de 10MB.');
          return;
        }
        if (file.type.startsWith('image/')) {
          setPreview(URL.createObjectURL(file));
        } else {
          setPreview(null);
        }
        setFileName(file.name);
        onFile(file);
      }}
      onReject={() => alert('Archivo no permitido o demasiado grande')}
      maxSize={10 * 1024 * 1024}
      accept={ACCEPTED_MIME_FILE}
      style={{
        border: '2px dashed #ced4da',
        borderRadius: '8px',
        background: '#fff',
        width: '100%',
        minHeight: 140,
        margin: '0',
        flex: 1, // Para que crezca en el layout flex
      }}
    >
      <Group justify="center" gap="sm" mih={140} style={{ pointerEvents: 'none', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <IconFingerprint size={32} color="var(--mantine-color-blue-6)" stroke={1.5} />
        <Text size="md" inline>
          {label}
        </Text>
        {preview ? (
          <Avatar src={preview} radius={8} size={60} />
        ) : fileName ? (
          <Text size="sm" c="dimmed">{fileName}</Text>
        ) : (
          <Text size="sm" c="dimmed">
            Adjunta imagen o PDF (máx 10MB)
          </Text>
        )}
      </Group>
    </Dropzone>
  );
}

const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

export function BelongingDropzone({ onFile }: { onFile: (file: File) => void }) {
  return (
    <Dropzone
      onDrop={(files) => {
        const file = files[0];
        if (file && file.size > 10 * 1024 * 1024) {
          alert('El archivo supera el tamaño máximo de 10MB.');
          return;
        }
        onFile(file);
      }}
      onReject={() => alert('Archivo no permitido o demasiado grande')}
      maxSize={10 * 1024 * 1024}
      accept={ACCEPTED_MIME}
      style={{
        border: '2px dashed #ced4da',
        borderRadius: '8px',
        background: '#fff',
      }}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
        </Dropzone.Idle>
        <div>
          <Text size="xl" inline>
            Arrastra aquí imágenes o PDF, o haz clic para seleccionar
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Adjunta archivos de hasta 10MB (.pdf, .jpeg, .png)
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
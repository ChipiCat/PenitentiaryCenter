import { Group, Text } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';

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
import React from 'react';
import { TextInput, Select, NumberInput, Group, Stack } from '@mantine/core';
import type { BasicInfoStepProps, BasicInfo } from '../../types'; // 🔧 Importar tipos específicos

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onUpdate }) => {
  const handleChange = (field: keyof BasicInfo, value: string | null) => { // 🔧 Tipo específico
    onUpdate({ [field]: value });
  };

  const handleNumberChange = (field: keyof BasicInfo, value: string | number | undefined) => { // 🔧 Tipo específico
    const numericValue = typeof value === 'string' 
      ? (value === '' ? undefined : parseInt(value, 10))
      : value;
    
    onUpdate({ [field]: numericValue });
  };

  return (
    <Stack gap="md">
      <Group grow>
        <TextInput
          label="Nombre"
          placeholder="Ingrese el nombre"
          value={data.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          required
        />
        <TextInput
          label="Apellido"
          placeholder="Ingrese el apellido"
          value={data.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
          required
        />
      </Group>

      <Group grow>
        <TextInput
          label="Cédula de Identidad"
          placeholder="Ingrese la cédula"
          value={data.identification || ''}
          onChange={(e) => handleChange('identification', e.target.value)}
          required
        />
        <NumberInput
          label="Edad"
          placeholder="Ingrese la edad"
          value={data.age || ''}
          onChange={(value) => handleNumberChange('age', value)}
          min={18}
          max={80}
          allowDecimal={false}
          allowNegative={false}
        />
      </Group>

      <Group grow>
        <Select
          label="Género"
          placeholder="Seleccione el género"
          value={data.gender || ''}
          onChange={(value) => handleChange('gender', value)}
          data={[
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' }
          ]}
          required
        />
        <TextInput
          label="Nacionalidad"
          placeholder="Nacionalidad"
          value={data.nationality || 'Boliviana'}
          onChange={(e) => handleChange('nationality', e.target.value)}
        />
      </Group>

      <TextInput
        label="Delito"
        placeholder="Descripción del delito"
        value={data.crime || ''}
        onChange={(e) => handleChange('crime', e.target.value)}
        required
      />

      <Group grow>
        <TextInput
          label="Sentencia"
          placeholder="Tiempo de sentencia"
          value={data.sentence || ''}
          onChange={(e) => handleChange('sentence', e.target.value)}
          required
        />
        <TextInput
          label="Bloque de Celda"
          placeholder="Ej: A-100"
          value={data.cellBlock || ''}
          onChange={(e) => handleChange('cellBlock', e.target.value)}
        />
      </Group>

      <Group grow>
        <Select
          label="Estado Legal"
          placeholder="Estado del proceso"
          value={data.legalStatus || ''}
          onChange={(value) => handleChange('legalStatus', value)}
          data={[
            { value: 'En proceso', label: 'En proceso' },
            { value: 'Sentenciado', label: 'Sentenciado' },
            { value: 'Apelación', label: 'En apelación' }
          ]}
        />
        <Select
          label="Comportamiento"
          placeholder="Comportamiento general"
          value={data.behavior || ''}
          onChange={(value) => handleChange('behavior', value)}
          data={[
            { value: 'Excelente', label: 'Excelente' },
            { value: 'Bueno', label: 'Bueno' },
            { value: 'Regular', label: 'Regular' },
            { value: 'Malo', label: 'Malo' }
          ]}
        />
      </Group>
    </Stack>
  );
};
import { zodResolver } from '@hookform/resolvers/zod';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as THREE from "three";
import { z } from 'zod';
import type { DepartmentPerformance } from '../department';
import { COLORS } from '../../colors';
import './DepartmentForm.scss';

const FormInputSchema = z.object({
  recordedDate: z.string().refine(val => !isNaN(Date.parse(val))), 
  spend: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  revenue: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  efficiency: z.string()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, "Must be between 0-100")
    .refine(val => {
      const num = parseFloat(val);
      return num >= 0 && num <= 100;
    }, "Must be between 0-100"),
  isCurrent: z.boolean()
});

const PerformanceOutputSchema = FormInputSchema.transform(data => ({
  recordedDate: new Date(data.recordedDate).toISOString(),
  spend: parseFloat(data.spend),
  revenue: parseFloat(data.revenue),
  efficiency: parseFloat(data.efficiency),
  isCurrent: data.isCurrent
}));

interface DepartmentPerformanceFormProps {
  onSubmit: (data: Omit<DepartmentPerformance, 'id'>) => Promise<void>;
  position: [number, number, number];
  departmentId: number;
}

export default function DepartmentPerformanceForm({ 
  onSubmit, 
  position,
  departmentId
}: DepartmentPerformanceFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const floatGroup = useRef<THREE.Group>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<z.infer<typeof FormInputSchema>>({
    resolver: zodResolver(FormInputSchema),
    defaultValues: {
      recordedDate: new Date().toISOString().split('T')[0],
      spend: '0',
      revenue: '0',
      efficiency: '0',
      isCurrent: false
    }
  });

  const onFormSubmit = async (formData: z.infer<typeof FormInputSchema>) => {
    try {
      setServerError(null);
      const result = await PerformanceOutputSchema.parseAsync(formData);
      await onSubmit({
        departmentId,
        ...result
      });
      reset();
    } catch (err) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof z.infer<typeof FormInputSchema>;
          setError(fieldName, {
            type: 'manual',
            message: issue.message
          });
        });
      } else {
        setServerError(
          err instanceof Error ? err.message : 'Submission failed'
        );
      }
    }
  };

  useFrame((state) => {
    if (floatGroup.current) {
      floatGroup.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      floatGroup.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group position={position} ref={floatGroup}>
      <mesh>
        <meshStandardMaterial
          color="#0a1a21"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.9}
          emissive={COLORS.PRIMARY}
          emissiveIntensity={0.2}
        />

        <Html
          transform
          center
          distanceFactor={10}
          position={[0, 0, 0.26]}
          className="department-form__container"
        >
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {serverError && (
              <div className="department-form__error">
                {serverError}
              </div>
            )}

            <div className="department-form__input-group">
              <label className="department-form__label">Date</label>
              <input
                type="date"
                {...register('recordedDate')}
                className="department-form__input"
              />
              {errors.recordedDate && (
                <p className="department-form__error">{errors.recordedDate.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Spend</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('spend')}
                className="department-form__input"
              />
              {errors.spend && (
                <p className="department-form__error">{errors.spend.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Revenue</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('revenue')}
                className="department-form__input"
              />
              {errors.revenue && (
                <p className="department-form__error">{errors.revenue.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Efficiency (%)</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('efficiency')}
                className="department-form__input"
              />
              {errors.efficiency && (
                <p className="department-form__error">{errors.efficiency.message}</p>
              )}
            </div>

            <div className="department-form__input-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  {...register('isCurrent')}
                />
                Set as current performance
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="department-form__button"
            >
              {isSubmitting ? 'Recording...' : 'Record Performance'}
            </button>
          </form>
        </Html>
      </mesh>

      <Text
        position={[0, 6.7, 0]}
        fontSize={0.5}
        color={COLORS.PRIMARY}
        anchorX="center"
        anchorY="middle"
        font="/fonts/orbitron-medium.otf"
      >
        New Performance Record
      </Text>
    </group>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as THREE from "three";
import { z } from 'zod';
import { COLORS } from '../../colors';
import type { Department } from '../department';
import "./DepartmentForm.scss";

const FormInputSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name too long"),
  headcount: z.string()
    .regex(/^\d+$/, "Must be a valid number"),
  currentEfficiency: z.string()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, "Must be between 0-100")
    .refine(val => {
      const num = parseFloat(val);
      return num >= 0 && num <= 100;
    }, "Must be between 0-100"),
  currentBudget: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  fiscalYear: z.string()
    .regex(/^\d{4}$/, "Must be a valid year"),
  latitude: z.string()
    .regex(/^-?\d{1,3}(\.\d{1,6})?$/, "Invalid latitude")
    .optional(),
  longitude: z.string()
    .regex(/^-?\d{1,3}(\.\d{1,6})?$/, "Invalid longitude")
    .optional()
});

const DepartmentOutputSchema = FormInputSchema.transform(data => ({
  name: data.name,
  headcount: parseInt(data.headcount),
  currentEfficiency: parseFloat(data.currentEfficiency),
  currentBudget: parseFloat(data.currentBudget),
  fiscalYear: parseInt(data.fiscalYear),
  latitude: data.latitude ? parseFloat(data.latitude) : undefined,
  longitude: data.longitude ? parseFloat(data.longitude) : undefined
}));

interface DepartmentFormProps {
  onSubmit: (data: Omit<Department, 'id'>) => Promise<void>;
  position: [number, number, number];
}

export default function DepartmentForm({ onSubmit, position }: DepartmentFormProps) {
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
      currentEfficiency: "0",
      currentBudget: "0",
      fiscalYear: new Date().getFullYear().toString()
    }
  });

  const onFormSubmit = async (formData: z.infer<typeof FormInputSchema>) => {
    try {
      setServerError(null);
      const result = await DepartmentOutputSchema.parseAsync(formData);
      await onSubmit(result);
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
              <label className="department-form__label">Department Name</label>
              <input
                type="text"
                {...register('name')}
                className="department-form__input"
              />
              {errors.name && (
                <p className="department-form__error">{errors.name.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Headcount</label>
              <input
                type="text"
                inputMode="numeric"
                {...register('headcount')}
                className="department-form__input"
              />
              {errors.headcount && (
                <p className="department-form__error">{errors.headcount.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Efficiency (%)</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('currentEfficiency')}
                className="department-form__input"
              />
              {errors.currentEfficiency && (
                <p className="department-form__error">{errors.currentEfficiency.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Budget</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('currentBudget')}
                className="department-form__input"
              />
              {errors.currentBudget && (
                <p className="department-form__error">{errors.currentBudget.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Fiscal Year</label>
              <input
                type="text"
                inputMode="numeric"
                {...register('fiscalYear')}
                className="department-form__input"
              />
              {errors.fiscalYear && (
                <p className="department-form__error">{errors.fiscalYear.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Latitude (optional)</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('latitude')}
                className="department-form__input"
                placeholder="e.g. 40.7128"
              />
              {errors.latitude && (
                <p className="department-form__error">{errors.latitude.message}</p>
              )}
            </div>

            <div className="department-form__input-group">
              <label className="department-form__label">Longitude (optional)</label>
              <input
                type="text"
                inputMode="decimal"
                {...register('longitude')}
                className="department-form__input"
                placeholder="e.g. -74.0060"
              />
              {errors.longitude && (
                <p className="department-form__error">{errors.longitude.message}</p>
              )}
            </div>


            <button
              type="submit"
              disabled={isSubmitting}
              className="department-form__button"
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
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
        New Department
      </Text>
    </group>
  );
}

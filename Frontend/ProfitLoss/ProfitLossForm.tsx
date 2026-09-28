import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateProfitLossDto } from './profitLoss';
import './ProfitLossForm.scss';

const schema = z.object({
  departmentId: z.number().int().positive('Department is required'),
  periodName: z
    .string()
    .min(1)
    .regex(/^(Q[1-4]|FY)-\d{4}$/, 'Format: Q3-2023 or FY-2023'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  revenue: z.string().refine(v => Number(v) >= 0, 'Must be ≥ 0'),
  cogs: z.string().refine(v => Number(v) >= 0, 'Must be ≥ 0'),
  operatingExpenses: z.string().refine(v => Number(v) >= 0, 'Must be ≥ 0'),
  isForecast: z.boolean(),
  lineItems: z.array(z.any()),
});

type FormValues = z.infer<typeof schema>;

interface IProps {
  onSubmit: (data: CreateProfitLossDto) => void | Promise<void>;
  onCancel: () => void;
}

export default function ProfitLossForm({ onSubmit, onCancel }: IProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentId: 1,
      periodName: '',
      periodStart: '',
      periodEnd: '',
      revenue: '',
      cogs: '',
      operatingExpenses: '',
      isForecast: false,
      lineItems: [],
    },
  });

  const periodStart = watch('periodStart');
  const periodEnd   = watch('periodEnd');
  const dateOrderError =
    periodStart &&
    periodEnd &&
    new Date(periodStart) >= new Date(periodEnd)
      ? 'End date must be after start date'
      : undefined;

  const onValid: SubmitHandler<FormValues> = (data) => {
    const dto: CreateProfitLossDto = {
      ...data,
      revenue: String(data.revenue),
      cogs: String(data.cogs),
      operatingExpenses: String(data.operatingExpenses),
      departmentId: Number(data.departmentId),
    };
    return onSubmit(dto);
  };

  return (
    <div className="profit-loss-form__container">
      <h2 className="profit-loss-form__title">Create P&L Statement</h2>

      <form onSubmit={handleSubmit(onValid)} className="profit-loss-form__form">
        <div className="profit-loss-form__input-group">
          <label className="profit-loss-form__label">Department *</label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <select {...field} className="profit-loss-form__input">
                <option value={1}>Finance</option>
                <option value={2}>Marketing</option>
                <option value={3}>Engineering</option>
              </select>
            )}
          />
          {errors.departmentId && (
            <span className="profit-loss-form__error">
              {errors.departmentId.message}
            </span>
          )}
        </div>

        <div className="profit-loss-form__input-group">
          <label className="profit-loss-form__label">Period Name *</label>
          <Controller
            name="periodName"
            control={control}
            render={({ field }) => (
              <input {...field} className="profit-loss-form__input" placeholder="Q3-2023" />
            )}
          />
          {errors.periodName && (
            <span className="profit-loss-form__error">
              {errors.periodName.message}
            </span>
          )}
        </div>

        <div className="profit-loss-form__input-group">
          <label className="profit-loss-form__label">Period Start *</label>
          <Controller
            name="periodStart"
            control={control}
            render={({ field }) => (
              <input type="date" {...field} className="profit-loss-form__input" />
            )}
          />
          {errors.periodStart && (
            <span className="profit-loss-form__error">
              {errors.periodStart.message}
            </span>
          )}
        </div>

        <div className="profit-loss-form__input-group">
          <label className="profit-loss-form__label">Period End *</label>
          <Controller
            name="periodEnd"
            control={control}
            render={({ field }) => (
              <input type="date" {...field} className="profit-loss-form__input" />
            )}
          />
          {errors.periodEnd && (
            <span className="profit-loss-form__error">
              {errors.periodEnd.message}
            </span>
          )}
          {dateOrderError && (
            <span className="profit-loss-form__error">{dateOrderError}</span>
          )}
        </div>

        {(['revenue', 'cogs', 'operatingExpenses'] as const).map(key => (
          <div key={key} className="profit-loss-form__input-group">
            <label className="profit-loss-form__label">
              {key.charAt(0).toUpperCase() +
                key.slice(1).replace(/([A-Z])/g, ' $1')}{' '}
              *
            </label>
            <Controller
              name={key}
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  className="profit-loss-form__input"
                />
              )}
            />
            {errors[key] && (
              <span className="profit-loss-form__error">
                {errors[key]?.message}
              </span>
            )}
          </div>
        ))}

        <div className="profit-loss-form__input-group">
          <label className="profit-loss-form__label">
            <Controller
              name="isForecast"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />{' '}
            Forecast?
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="profit-loss-form__button"
        >
          {isSubmitting ? 'Saving…' : 'Save Statement'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="profit-loss-form__button profit-loss-form__button--secondary"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

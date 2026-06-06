import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * 「预约现场演示 / 联系我们」弹窗（自包含、可在站内任意页面复用）。
 *
 * - 表单字段对照设计稿：名字 / 姓氏 / 公司机构 / 邮箱 / 联系方式 / 意向 / 留言 / 隐私同意。
 * - 提交后通过 mailto: 唤起本地邮件客户端，把填报内容整理进邮件正文。
 * - 纯 Tailwind + framer-motion，依赖品牌色令牌 brand-blue / brand-ink。
 */
export type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  /** 弹窗标题 */
  title?: string;
  /** 引导副标题 */
  subtitle?: string;
  /** 业务上下文（如「强化印记 · 台球」），写入邮件正文并作默认意向后缀 */
  context?: string;
  /** 意向下拉项 */
  intents?: string[];
  /** 收件邮箱 */
  recipientEmail?: string;
};

const DEFAULT_INTENTS = [
  "预约现场演示",
  "了解产品方案",
  "加盟 / 代理咨询",
  "其他",
];

const DEFAULT_EMAIL = "contact@dachuan-jiliu.com";

type FormState = {
  firstName: string;
  lastName: string;
  org: string;
  email: string;
  phone: string;
  intent: string;
  message: string;
  agree: boolean;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  org: "",
  email: "",
  phone: "",
  intent: "",
  message: "",
  agree: false,
};

const labelCls = "mb-2 block text-sm font-semibold text-brand-ink";
const inputCls = [
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-brand-ink",
  "placeholder:text-gray-400 outline-none transition-colors",
  "focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20",
].join(" ");

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function ContactModal({
  open,
  onClose,
  title = "预约现场演示",
  subtitle = "留下你的联系方式，我们会尽快与你对接一场面向门店的现场演示。",
  context,
  intents = DEFAULT_INTENTS,
  recipientEmail = DEFAULT_EMAIL,
}: ContactModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [sent, setSent] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  // 关闭后重置表单与状态
  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSent(false);
    }
  }, [open]);

  // Esc 关闭 + 打开时锁定 body 滚动 + 焦点移入首个字段
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => ({ ...e, [key]: undefined }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "请输入名字";
    if (!form.lastName.trim()) next.lastName = "请输入姓氏";
    if (!form.org.trim()) next.org = "请输入公司或机构名称";
    if (!form.email.trim()) next.email = "请输入邮箱地址";
    else if (!isEmail(form.email)) next.email = "请输入正确的邮箱地址";
    if (!form.phone.trim()) next.phone = "请输入正确的联系方式";
    if (!form.agree) next.agree = "请阅读并同意隐私政策";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildMailto = () => {
    const intent = form.intent || intents[0];
    const subject = context ? `${title} - ${context}` : title;
    const body = [
      context ? `业务板块：${context}` : null,
      `意向：${intent}`,
      `姓名：${form.lastName}${form.firstName}`,
      `公司/机构：${form.org}`,
      `邮箱：${form.email}`,
      `联系方式：${form.phone}`,
      "",
      "留言：",
      form.message || "（无）",
    ]
      .filter((l): l is string => l !== null)
      .join("\r\n");
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    window.location.href = buildMailto();
    setSent(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative z-10 max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-3xl bg-white p-7 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.45)] sm:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-brand-ink"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            {sent ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-2xl text-brand-blue">
                  ✓
                </div>
                <h2
                  id={titleId}
                  className="mt-5 text-2xl font-bold text-brand-ink"
                >
                  已为你打开邮件客户端
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-gray-500">
                  请在弹出的邮件中确认并发送。如果没有自动唤起，也可直接发邮件至{" "}
                  <a
                    href={`mailto:${recipientEmail}`}
                    className="font-semibold text-brand-blue underline"
                  >
                    {recipientEmail}
                  </a>
                  。
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 rounded-full bg-brand-blue px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
                >
                  完成
                </button>
              </div>
            ) : (
              <>
                <h2
                  id={titleId}
                  className="text-center text-2xl font-bold tracking-tight text-brand-ink sm:text-3xl"
                >
                  {title}
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-gray-500">
                  {subtitle}
                </p>

                <form
                  className="mt-8 grid gap-5 sm:grid-cols-2"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <Field label="名字" required error={errors.firstName}>
                    <input
                      ref={firstFieldRef}
                      className={inputCls}
                      placeholder="请输入名字"
                      value={form.firstName}
                      onChange={(e) => set("firstName")(e.target.value)}
                    />
                  </Field>
                  <Field label="姓氏" required error={errors.lastName}>
                    <input
                      className={inputCls}
                      placeholder="请输入姓氏"
                      value={form.lastName}
                      onChange={(e) => set("lastName")(e.target.value)}
                    />
                  </Field>

                  <Field label="公司/机构" required error={errors.org}>
                    <input
                      className={inputCls}
                      placeholder="请输入公司或机构名称"
                      value={form.org}
                      onChange={(e) => set("org")(e.target.value)}
                    />
                  </Field>
                  <Field label="邮箱地址" required error={errors.email}>
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="请输入正确的邮箱地址"
                      value={form.email}
                      onChange={(e) => set("email")(e.target.value)}
                    />
                  </Field>

                  <Field label="联系方式" required error={errors.phone}>
                    <input
                      className={inputCls}
                      placeholder="请输入正确的联系方式"
                      value={form.phone}
                      onChange={(e) => set("phone")(e.target.value)}
                    />
                  </Field>
                  <Field label="意向">
                    <select
                      className={inputCls}
                      value={form.intent}
                      onChange={(e) => set("intent")(e.target.value)}
                    >
                      {intents.map((it) => (
                        <option key={it} value={it}>
                          {it}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="留言">
                      <textarea
                        rows={4}
                        className={[inputCls, "resize-y"].join(" ")}
                        placeholder="门店规模 / 台位（场地）数 / 痛点 / 期望上线时间"
                        value={form.message}
                        onChange={(e) => set("message")(e.target.value)}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-start gap-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
                        checked={form.agree}
                        onChange={(e) => set("agree")(e.target.checked)}
                      />
                      <span>
                        我已阅读、理解隐私政策，并同意按所述存储和使用我的个人资料。
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    {errors.agree && (
                      <p className="mt-1.5 text-xs text-rose-500">
                        {errors.agree}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 sm:col-span-2 sm:flex sm:justify-center">
                    <button
                      type="submit"
                      className="w-full rounded-full bg-brand-blue px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-blue-hover hover:shadow-[0_16px_32px_-12px_rgba(6,126,253,0.6)] sm:w-auto sm:min-w-[220px]"
                    >
                      提交
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className={labelCls}>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

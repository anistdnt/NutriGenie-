"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthProfileSchema, HealthProfileInput } from "@/src/lib/validators/health.schema";
import { updateHealthProfile } from "@/src/lib/actions/health.actions";
import { Loader2, User as UserIcon, Shield, Target, Plus, X, History, Save, Camera, Trash2, AlertTriangle, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/src/components/providers/ToastProvider";

type GeneralProfile = {
  name: string;
  email: string;
  image: string;
};

type MealPlanSummary = {
  _id: string;
  title: string;
  createdAt: string;
  totalNutrients?: {
    calories?: number;
  };
};
type MealPlanSavedEventDetail = MealPlanSummary;
type MealPlanDeletedEventDetail = { id: string };
type Option<T extends string> = { value: T; label: string };

const GENDER_OPTIONS: Option<"male" | "female" | "other">[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const FOOD_OPTIONS: Option<"veg" | "non-veg" | "vegan">[] = [
  { value: "veg", label: "Veg" },
  { value: "non-veg", label: "Non-Veg" },
  { value: "vegan", label: "Vegan" },
];

const CUISINE_OPTIONS: Option<"indian" | "western" | "mixed">[] = [
  { value: "indian", label: "Indian" },
  { value: "western", label: "Western" },
  { value: "mixed", label: "Mixed" },
];

const ACTIVITY_OPTIONS: Option<"sedentary" | "light" | "moderate" | "active" | "very_active">[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very Active" },
];

const DEFAULT_AVATAR = "/default-avatar.svg";
const normalizeImageSrc = (value?: string | null) => {
  if (!value) return DEFAULT_AVATAR;
  if (value.startsWith("/")) return value;
  if (value.startsWith("data:image/")) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return value;
    }
    return DEFAULT_AVATAR;
  } catch {
    return DEFAULT_AVATAR;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const { data: session, update } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHealth, setIsSavingHealth] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [general, setGeneral] = useState<GeneralProfile>({ name: "", email: "", image: "" });
  const [savedMealPlans, setSavedMealPlans] = useState<MealPlanSummary[]>([]);
  const [deletingMealPlanId, setDeletingMealPlanId] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [deleteTextConfirm, setDeleteTextConfirm] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      allergies: [],
      medicalConditions: [],
      medications: [],
      dietaryRestrictions: [],
      healthGoals: [],
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, mealRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/meal-plan", { cache: "no-store" }),
        ]);

        const profileData = await profileRes.json();
        const mealData = await mealRes.json();

        if (profileData.user) {
          const user = profileData.user;
          reset({
            age: user.age,
            gender: user.gender,
            height: user.height,
            allergies: user.allergies || [],
            medicalConditions: user.medicalConditions || [],
            medications: user.medications || [],
            dietaryRestrictions: user.dietaryRestrictions || [],
            healthGoals: user.healthGoals || [],
            activityLevel: user.activityLevel,
            targetCalories: user.targetCalories,
            targetWeight: user.targetWeight,
            foodPreference: user.foodPreference,
            cuisinePreference: user.cuisinePreference,
          });

          setGeneral({
            name: user.name || "",
            email: user.email || session?.user?.email || "",
            image: user.image || session?.user?.image || "",
          });
        }

        if (mealData.mealPlans) {
          setSavedMealPlans(mealData.mealPlans as MealPlanSummary[]);
        }
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [reset, session?.user?.email, session?.user?.image]);

  useEffect(() => {
    const onMealPlanSaved = (event: Event) => {
      const customEvent = event as CustomEvent<MealPlanSavedEventDetail>;
      const plan = customEvent.detail;
      if (!plan) return;

      setSavedMealPlans((prev) => {
        const next = [plan, ...prev.filter((item) => item._id !== plan._id)];
        return next;
      });
    };

    const onMealPlanDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<MealPlanDeletedEventDetail>;
      const deletedId = customEvent.detail?.id;
      if (!deletedId) return;
      setSavedMealPlans((prev) => prev.filter((item) => item._id !== deletedId));
    };

    window.addEventListener("mealplan:saved", onMealPlanSaved as EventListener);
    window.addEventListener("mealplan:deleted", onMealPlanDeleted as EventListener);
    return () => {
      window.removeEventListener("mealplan:saved", onMealPlanSaved as EventListener);
      window.removeEventListener("mealplan:deleted", onMealPlanDeleted as EventListener);
    };
  }, []);

  const handleDeleteMealPlan = async (id: string) => {
    try {
      setDeletingMealPlanId(id);
      const res = await fetch(`/api/meal-plan/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete meal plan");
      }

      setSavedMealPlans((prev) => prev.filter((item) => item._id !== id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mealplan:deleted", { detail: { id } }));
      }
      toast.success("Meal plan deleted.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete meal plan.");
    } finally {
      setDeletingMealPlanId(null);
    }
  };

  const resetDeleteModal = () => {
    setIsDeleteAccountModalOpen(false);
    setDeleteEmailConfirm("");
    setDeleteTextConfirm("");
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmEmail: deleteEmailConfirm,
          confirmText: deleteTextConfirm,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete account.");
      }

      toast.success("Account deleted successfully.");
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.");
      setIsDeletingAccount(false);
    }
  };

  const onSubmitHealth = async (data: HealthProfileInput) => {
    setIsSavingHealth(true);
    const result = await updateHealthProfile(data);
    setIsSavingHealth(false);

    if (result.success) {
      toast.success("Health profile updated.");
      router.refresh();
      return;
    }

    toast.error(result.error || "Failed to update profile.");
  };

  const onSaveGeneral = async () => {
    try {
      setIsSavingGeneral(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: general.name,
          image: general.image,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to update general profile.");
        return;
      }

      await update();
      toast.success("General profile updated.");
      router.refresh();
    } catch (error) {
      console.error("Failed to save general profile:", error);
      toast.error("Failed to update general profile.");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const updateProfileImage = async (imageValue: string) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageValue,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to update image");
    }
    await update();
    return result;
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 320;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not process image."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error("Unable to read image file."));
        img.src = objectUrl;
      });

      URL.revokeObjectURL(objectUrl);

      if (dataUrl.length > 900_000) {
        throw new Error("Image is too large. Please choose a smaller image.");
      }

      await updateProfileImage(dataUrl);
      setGeneral((prev) => ({ ...prev, image: dataUrl }));
      toast.success("Profile image updated.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile image.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleArrayInput = (field: keyof HealthProfileInput, value: string) => {
    if (!value.trim()) return;
    const current = (watch(field) || []) as string[];
    if (!current.includes(value)) {
      setValue(field, [...current, value] as never, { shouldDirty: true });
    }
  };

  const removeArrayItem = (field: keyof HealthProfileInput, index: number) => {
    const current = (watch(field) || []) as string[];
    const updated = [...current];
    updated.splice(index, 1);
    setValue(field, updated as never, { shouldDirty: true });
  };

  const avatarImage = general.image || session?.user?.image || DEFAULT_AVATAR;

  useEffect(() => {
    setAvatarSrc(normalizeImageSrc(avatarImage));
  }, [avatarImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const ArrayInput = ({ field, label, placeholder }: { field: keyof HealthProfileInput; label: string; placeholder: string }) => {
    const items = (watch(field) || []) as string[];
    return (
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {items.map((item, idx) => (
            <span key={`${field}-${item}-${idx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {item}
              <button type="button" onClick={() => removeArrayItem(field, idx)} className="text-gray-400 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleArrayInput(field, (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              handleArrayInput(field, input.value);
              input.value = "";
            }}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const ThemedSelect = <T extends string>({
    label,
    field,
    options,
  }: {
    label: string;
    field: keyof HealthProfileInput;
    options: Option<T>[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const currentValue = watch(field) as T | undefined;
    const selectedOption = options.find((option) => option.value === currentValue);

    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (!wrapperRef.current) return;
        if (!wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      window.addEventListener("mousedown", handleOutsideClick);
      return () => window.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
      <div className="space-y-1.5" ref={wrapperRef}>
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
        <input type="hidden" {...register(field as never)} />
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-400/65 bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.12)] transition hover:border-emerald-300/85 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span className={selectedOption ? "text-slate-100" : "text-slate-400"}>
              {selectedOption?.label || `Choose ${label.toLowerCase()}`}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
              <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
                {options.map((option) => {
                  const isSelected = currentValue === option.value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setValue(field, option.value as never, { shouldDirty: true, shouldValidate: true });
                          setIsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-emerald-300" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 px-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Profile Settings</h1>
          <p className="text-gray-500 font-medium mt-2">Manage your account details, health profile, and saved meal plans.</p>
        </div>

        <Section title="General Details" icon={UserIcon}>
          <div className="grid grid-cols-1 md:grid-cols-[120px,1fr] gap-6 items-start">
            <div className="space-y-3">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-emerald-300/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Image
                  src={avatarSrc}
                  alt="Profile avatar"
                  fill
                  className="object-cover"
                  onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute -right-1 -bottom-1 grid place-items-center w-8 h-8 rounded-full border border-emerald-300/50 bg-slate-900 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.45)] hover:bg-slate-800 disabled:opacity-60"
                  aria-label="Update profile image"
                  title="Update profile image"
                >
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Click the camera icon to upload from your device. Google users see Google photo by default.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Name</label>
                <input
                  value={general.name}
                  onChange={(e) => setGeneral((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                <input
                  value={general.email}
                  disabled
                  className="mt-1 w-full bg-gray-100 dark:bg-gray-800/60 border-none rounded-2xl px-5 py-3 text-sm text-gray-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onSaveGeneral}
                  disabled={isSavingGeneral}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase tracking-wider disabled:opacity-60"
                >
                  {isSavingGeneral ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save General
                </button>
              </div>
            </div>
          </div>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmitHealth)}>
              <Section title="Basic Metrics" icon={UserIcon}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Age</label>
                      <input {...register("age", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <ThemedSelect label="Gender" field="gender" options={GENDER_OPTIONS} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Height (cm)</label>
                      <input {...register("height", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Weight</label>
                      <input {...register("targetWeight", { valueAsNumber: true })} type="number" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ThemedSelect label="Dietary Preference" field="foodPreference" options={FOOD_OPTIONS} />
                    <ThemedSelect label="Preferred Cuisine" field="cuisinePreference" options={CUISINE_OPTIONS} />
                  </div>
                </div>
              </Section>

              <Section title="Medical & Restrictions" icon={Shield}>
                <div className="space-y-6">
                  <ArrayInput field="allergies" label="Food Allergies" placeholder="e.g. Peanuts, Shellfish" />
                  <ArrayInput field="dietaryRestrictions" label="Dietary Restrictions" placeholder="e.g. Keto, Gluten-free" />
                  <ArrayInput field="medicalConditions" label="Medical Conditions" placeholder="e.g. Diabetes, Hypertension" />
                </div>
              </Section>

              <Section title="Goals & Lifestyle" icon={Target}>
                <div className="space-y-6">
                  <ThemedSelect label="Activity Level" field="activityLevel" options={ACTIVITY_OPTIONS} />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Daily Calorie Target</label>
                    <input {...register("targetCalories", { valueAsNumber: true })} type="number" step="50" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none" />
                  </div>
                  <ArrayInput field="healthGoals" label="Personal Goals" placeholder="e.g. Build Muscle, Better Sleep" />
                </div>
              </Section>

              <div className="sticky bottom-8 mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl z-20">
                <button
                  type="submit"
                  disabled={isSavingHealth}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  {isSavingHealth ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Health Profile...
                    </span>
                  ) : "Save Health Profile"}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <Section title="Saved Meal Plans" icon={History}>
              {savedMealPlans.length === 0 ? (
                <p className="text-sm text-gray-500">No saved meal plans yet. Generate one from your dashboard chat.</p>
              ) : (
                <div className="space-y-3">
                  {savedMealPlans.slice(0, 8).map((plan) => (
                    <div key={plan._id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{plan.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(plan.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {plan.totalNutrients?.calories ? `${plan.totalNutrients.calories} kcal` : "Calories unavailable"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteMealPlan(plan._id)}
                          disabled={deletingMealPlanId === plan._id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                          aria-label="Delete meal plan"
                          title="Delete meal plan"
                        >
                          {deletingMealPlanId === plan._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link href="/meal-plan" className="inline-flex mt-2 text-sm font-bold text-emerald-600 hover:underline">
                    View all saved meal plans
                  </Link>
                </div>
              )}
            </Section>

            <Section title="Danger Zone" icon={AlertTriangle}>
              <p className="text-sm text-gray-500 mb-3">
                Permanently delete your account and all associated data including meal plans and chat history.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteAccountModalOpen(true)}
                className="w-full rounded-2xl border border-rose-400/40 bg-rose-950/30 px-4 py-3 text-sm font-black uppercase tracking-wider text-rose-300 hover:bg-rose-900/40"
              >
                Delete My Account
              </button>
            </Section>
          </div>
        </div>
      </div>

      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-rose-900/40 p-2 text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Delete Account</h3>
                <p className="mt-1 text-sm text-slate-300">
                  This action is permanent. All your saved plans and chat history will be removed.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Type your email to confirm
                </label>
                <input
                  type="email"
                  value={deleteEmailConfirm}
                  onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                  placeholder={general.email || "you@example.com"}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-400/60"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteTextConfirm}
                  onChange={(e) => setDeleteTextConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-rose-400/60"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={resetDeleteModal}
                disabled={isDeletingAccount}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  isDeletingAccount ||
                  deleteTextConfirm.trim() !== "DELETE" ||
                  deleteEmailConfirm.trim().toLowerCase() !== (general.email || "").trim().toLowerCase()
                }
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-black text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {isDeletingAccount ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT 'buyer' CHECK (account_type IN ('buyer','seller')),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own profile readable" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- prevent users from self-verifying
CREATE OR REPLACE FUNCTION public.protect_verified()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verified := OLD.verified;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect_verified BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_verified();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE WHEN NEW.raw_user_meta_data->>'account_type' = 'seller' THEN 'seller' ELSE 'buyer' END
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description_bn text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  type text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('Sale','Rent')),
  price bigint NOT NULL CHECK (price >= 0),
  negotiable boolean NOT NULL DEFAULT false,
  division text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  beds int NOT NULL DEFAULT 0,
  baths int NOT NULL DEFAULT 0,
  size int NOT NULL DEFAULT 0,
  amenities text[] NOT NULL DEFAULT '{}',
  seller_name text NOT NULL DEFAULT '',
  seller_phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','rented')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are public" ON public.listings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owner inserts" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner or admin updates" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner or admin deletes" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER listings_touch BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX listings_created_idx ON public.listings (created_at DESC);
CREATE INDEX listings_owner_idx ON public.listings (owner_id);
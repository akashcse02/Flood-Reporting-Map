CREATE OR REPLACE FUNCTION public.verified_sellers(_ids uuid[])
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE verified = true AND id = ANY(_ids)
$$;
GRANT EXECUTE ON FUNCTION public.verified_sellers(uuid[]) TO anon, authenticated;
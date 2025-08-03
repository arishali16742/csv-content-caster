
CREATE OR REPLACE FUNCTION public.get_all_bookings_with_details()
RETURNS TABLE (
    id uuid,
    package_id uuid,
    days integer,
    total_price numeric,
    price_before_admin_discount numeric,
    members integer,
    with_flights boolean,
    selected_date timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    with_visa boolean,
    visa_cost numeric,
    user_id uuid,
    phone_number text,
    best_time_to_connect text,
    package_title text,
    package_country text,
    package_destinations text[],
    profile_email text,
    profile_first_name text,
    profile_last_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can run this function
  IF NOT public.is_user_admin(auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.package_id,
    c.days,
    c.total_price,
    c.price_before_admin_discount,
    c.members,
    c.with_flights,
    c.selected_date,
    c.created_at,
    c.updated_at,
    c.with_visa,
    c.visa_cost,
    c.user_id,
    c.phone_number,
    c.best_time_to_connect,
    pkg.title AS package_title,
    pkg.country AS package_country,
    pkg.destinations AS package_destinations,
    COALESCE(p.email, ur.email) AS profile_email,
    p.first_name AS profile_first_name,
    p.last_name AS profile_last_name
  FROM
    public.cart c
  LEFT JOIN
    public.packages pkg ON c.package_id = pkg.id
  LEFT JOIN
    public.profiles p ON c.user_id = p.id
  LEFT JOIN
    (SELECT DISTINCT ON (ur_inner.user_id) ur_inner.user_id, ur_inner.email
     FROM public.user_roles AS ur_inner
     WHERE ur_inner.user_id IS NOT NULL) AS ur ON c.user_id = ur.user_id
  ORDER BY
    c.created_at DESC;
END;
$$;

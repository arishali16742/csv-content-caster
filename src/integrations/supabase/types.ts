export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog: {
        Row: {
          additional_images: string[] | null
          author: string | null
          author_image: string | null
          categories: string[] | null
          category: string | null
          content: string | null
          created_at: string
          date_written: string | null
          editor_name: string | null
          excerpt: string | null
          id: string
          image: string | null
          itinerary: string | null
          position: number | null
          price: string | null
          published: boolean | null
          show_on_homepage: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          author?: string | null
          author_image?: string | null
          categories?: string[] | null
          category?: string | null
          content?: string | null
          created_at?: string
          date_written?: string | null
          editor_name?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          itinerary?: string | null
          position?: number | null
          price?: string | null
          published?: boolean | null
          show_on_homepage?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          author?: string | null
          author_image?: string | null
          categories?: string[] | null
          category?: string | null
          content?: string | null
          created_at?: string
          date_written?: string | null
          editor_name?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          itinerary?: string | null
          position?: number | null
          price?: string | null
          published?: boolean | null
          show_on_homepage?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_popup_settings: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_friendly_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          applied_coupon_details: string | null
          best_time_to_connect: string | null
          booking_type: string
          created_at: string
          days: number
          id: string
          members: number | null
          package_id: string | null
          phone_number: string | null
          price_before_admin_discount: number | null
          selected_date: string | null
          total_price: number
          updated_at: string
          user_id: string | null
          visa_cost: number | null
          with_flights: boolean | null
          with_visa: boolean | null
        }
        Insert: {
          applied_coupon_details?: string | null
          best_time_to_connect?: string | null
          booking_type?: string
          created_at?: string
          days: number
          id?: string
          members?: number | null
          package_id?: string | null
          phone_number?: string | null
          price_before_admin_discount?: number | null
          selected_date?: string | null
          total_price: number
          updated_at?: string
          user_id?: string | null
          visa_cost?: number | null
          with_flights?: boolean | null
          with_visa?: boolean | null
        }
        Update: {
          applied_coupon_details?: string | null
          best_time_to_connect?: string | null
          booking_type?: string
          created_at?: string
          days?: number
          id?: string
          members?: number | null
          package_id?: string | null
          phone_number?: string | null
          price_before_admin_discount?: number | null
          selected_date?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
          visa_cost?: number | null
          with_flights?: boolean | null
          with_visa?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      counter_backgrounds: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          position: number | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      counter_stats: {
        Row: {
          created_at: string
          happy_customers: number
          id: string
          packages_booked: number
          updated_at: string
          visa_booked: number
        }
        Insert: {
          created_at?: string
          happy_customers?: number
          id?: string
          packages_booked?: number
          updated_at?: string
          visa_booked?: number
        }
        Update: {
          created_at?: string
          happy_customers?: number
          id?: string
          packages_booked?: number
          updated_at?: string
          visa_booked?: number
        }
        Relationships: []
      }
      destination_banners: {
        Row: {
          banner_image: string
          created_at: string
          description: string | null
          destination_name: string
          id: string
          is_default: boolean
          total_packages: number | null
          updated_at: string
        }
        Insert: {
          banner_image: string
          created_at?: string
          description?: string | null
          destination_name: string
          id?: string
          is_default?: boolean
          total_packages?: number | null
          updated_at?: string
        }
        Update: {
          banner_image?: string
          created_at?: string
          description?: string | null
          destination_name?: string
          id?: string
          is_default?: boolean
          total_packages?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      detailed_itineraries: {
        Row: {
          created_at: string
          id: string
          itinerary_data: Json
          package_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          itinerary_data?: Json
          package_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          itinerary_data?: Json
          package_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "detailed_itineraries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          content_data: Json
          content_type: string
          created_at: string
          id: string
          original_id: string | null
          updated_at: string
        }
        Insert: {
          content_data: Json
          content_type: string
          created_at?: string
          id?: string
          original_id?: string | null
          updated_at?: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          created_at?: string
          id?: string
          original_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dub_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dubs_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dubs2_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dubsss_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      explore_destinations: {
        Row: {
          created_at: string
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          created_at: string
          hero_description: string | null
          hero_image: string
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hero_description?: string | null
          hero_image: string
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hero_description?: string | null
          hero_image?: string
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          display_name: string
          id: string
          image_shape: string
          is_visible: boolean
          position: number
          section_key: string
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          image_shape?: string
          is_visible?: boolean
          position?: number
          section_key: string
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          image_shape?: string
          is_visible?: boolean
          position?: number
          section_key?: string
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hot_destinations: {
        Row: {
          country: string
          created_at: string
          description: string
          discount: string
          duration: string | null
          id: string
          image: string
          name: string
          old_price: number
          position: number | null
          price: number
          rating: number
          status: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          discount: string
          duration?: string | null
          id?: string
          image: string
          name: string
          old_price: number
          position?: number | null
          price: number
          rating: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          discount?: string
          duration?: string | null
          id?: string
          image?: string
          name?: string
          old_price?: number
          position?: number | null
          price?: number
          rating?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      image_layout1_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_layout2_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_layout3_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_layout4_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_popup_settings: {
        Row: {
          created_at: string
          discount_text: string | null
          id: string
          image_url: string
          is_active: boolean | null
          subtitle: string | null
          terms_text: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_text?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          subtitle?: string | null
          terms_text?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_text?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          subtitle?: string | null
          terms_text?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      middle_east_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oceania_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      package_details: {
        Row: {
          activity_details: Json | null
          attractions: string[]
          combo_details: Json | null
          created_at: string
          flight_details: Json | null
          hero_image: string
          hotel_details: Json | null
          hotels: string[]
          id: string
          itinerary: Json | null
          meal_details: Json | null
          package_id: string | null
          pricing: Json | null
          updated_at: string
        }
        Insert: {
          activity_details?: Json | null
          attractions: string[]
          combo_details?: Json | null
          created_at?: string
          flight_details?: Json | null
          hero_image: string
          hotel_details?: Json | null
          hotels: string[]
          id?: string
          itinerary?: Json | null
          meal_details?: Json | null
          package_id?: string | null
          pricing?: Json | null
          updated_at?: string
        }
        Update: {
          activity_details?: Json | null
          attractions?: string[]
          combo_details?: Json | null
          created_at?: string
          flight_details?: Json | null
          hero_image?: string
          hotel_details?: Json | null
          hotels?: string[]
          id?: string
          itinerary?: Json | null
          meal_details?: Json | null
          package_id?: string | null
          pricing?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_details_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_routes: {
        Row: {
          created_at: string
          id: string
          package_id: string | null
          route_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id?: string | null
          route_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string | null
          route_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_routes_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          activities_count: number | null
          advance_booking_discount: number | null
          banner_image: string | null
          combo_type: string | null
          country: string
          created_at: string
          deal_type: string | null
          destinations: string[]
          duration: string
          featured_locations: string[] | null
          gallery_images: string[] | null
          hotel_category: string | null
          id: string
          image: string
          includes: string[]
          meals_included: string | null
          mood: string
          nights: number | null
          original_price: string
          per_person_price: number | null
          position: number | null
          price: string
          price_increase_warning: string | null
          publish_to: string[] | null
          rating: number
          special_features: string[] | null
          status: string | null
          title: string
          total_original_price: number | null
          transfer_included: boolean | null
          trip_type: string
          updated_at: string
        }
        Insert: {
          activities_count?: number | null
          advance_booking_discount?: number | null
          banner_image?: string | null
          combo_type?: string | null
          country: string
          created_at?: string
          deal_type?: string | null
          destinations: string[]
          duration: string
          featured_locations?: string[] | null
          gallery_images?: string[] | null
          hotel_category?: string | null
          id?: string
          image: string
          includes: string[]
          meals_included?: string | null
          mood: string
          nights?: number | null
          original_price: string
          per_person_price?: number | null
          position?: number | null
          price: string
          price_increase_warning?: string | null
          publish_to?: string[] | null
          rating: number
          special_features?: string[] | null
          status?: string | null
          title: string
          total_original_price?: number | null
          transfer_included?: boolean | null
          trip_type: string
          updated_at?: string
        }
        Update: {
          activities_count?: number | null
          advance_booking_discount?: number | null
          banner_image?: string | null
          combo_type?: string | null
          country?: string
          created_at?: string
          deal_type?: string | null
          destinations?: string[]
          duration?: string
          featured_locations?: string[] | null
          gallery_images?: string[] | null
          hotel_category?: string | null
          id?: string
          image?: string
          includes?: string[]
          meals_included?: string | null
          mood?: string
          nights?: number | null
          original_price?: string
          per_person_price?: number | null
          position?: number | null
          price?: string
          price_increase_warning?: string | null
          publish_to?: string[] | null
          rating?: number
          special_features?: string[] | null
          status?: string | null
          title?: string
          total_original_price?: number | null
          transfer_included?: boolean | null
          trip_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          logo: string
          name: string
          position: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo: string
          name: string
          position?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string
          name?: string
          position?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      popular_destinations: {
        Row: {
          country: string
          created_at: string
          description: string
          discount: string
          duration: string | null
          id: string
          image: string
          name: string
          old_price: number | null
          position: number | null
          price: number
          rating: number
          status: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          discount: string
          duration?: string | null
          id?: string
          image: string
          name: string
          old_price?: number | null
          position?: number | null
          price: number
          rating: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          discount?: string
          duration?: string | null
          id?: string
          image?: string
          name?: string
          old_price?: number | null
          position?: number | null
          price?: number
          rating?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scandinavia_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      south_east_asian_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      travel_history: {
        Row: {
          created_at: string
          destination: string
          id: string
          notes: string | null
          travel_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          notes?: string | null
          travel_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          notes?: string | null
          travel_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trending_destinations: {
        Row: {
          country: string
          created_at: string
          description: string
          discount: string
          duration: string | null
          id: string
          image: string
          name: string
          old_price: number
          position: number | null
          price: number
          rating: number
          status: string | null
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          discount: string
          duration?: string | null
          id?: string
          image: string
          name: string
          old_price: number
          position?: number | null
          price: number
          rating: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          discount?: string
          duration?: string | null
          id?: string
          image?: string
          name?: string
          old_price?: number
          position?: number | null
          price?: number
          rating?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unique_experiences: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      united_states_destinations: {
        Row: {
          created_at: string
          discount: string | null
          emoji: string
          id: string
          image: string | null
          name: string
          position: number | null
          status: string | null
          title_line: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount?: string | null
          emoji: string
          id?: string
          image?: string | null
          name: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string | null
          emoji?: string
          id?: string
          image?: string | null
          name?: string
          position?: number | null
          status?: string | null
          title_line?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          action_type: string
          created_at: string
          id: string
          item_id: string
          item_name: string
          item_type: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          item_id: string
          item_name: string
          item_type: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          coupon_code: string
          created_at: string
          discount: string
          expires_at: string
          id: string
          offer_title: string
          updated_at: string
          used: boolean
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          discount: string
          expires_at: string
          id?: string
          offer_title: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          discount?: string
          expires_at?: string
          id?: string
          offer_title?: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      visa_free_destinations: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          position: number | null
          price: string
          status: string | null
          title_line: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          position?: number | null
          price: string
          status?: string | null
          title_line: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          position?: number | null
          price?: string
          status?: string | null
          title_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      visa_rates: {
        Row: {
          created_at: string
          destination_country: string
          id: string
          origin_country: string
          price_15_days: number
          price_30_days: number
          price_yearly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_country: string
          id?: string
          origin_country: string
          price_15_days?: number
          price_30_days?: number
          price_yearly?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_country?: string
          id?: string
          origin_country?: string
          price_15_days?: number
          price_30_days?: number
          price_yearly?: number
          updated_at?: string
        }
        Relationships: []
      }
      wheel_offers: {
        Row: {
          active: boolean
          color: string
          created_at: string
          discount: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          discount: string
          id?: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          discount?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_bookings_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          package_id: string
          days: number
          total_price: number
          price_before_admin_discount: number
          members: number
          with_flights: boolean
          selected_date: string
          created_at: string
          updated_at: string
          with_visa: boolean
          visa_cost: number
          user_id: string
          phone_number: string
          best_time_to_connect: string
          package_title: string
          package_country: string
          package_destinations: string[]
          profile_email: string
          profile_first_name: string
          profile_last_name: string
          booking_type: string
          applied_coupon_details: string
        }[]
      }
      is_user_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

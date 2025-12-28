
const dotenv = require('dotenv');
dotenv.config();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('Checking buckets at:', supabaseUrl);
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
        console.error('Error listing buckets:', error)
        return
    }

    const loansBucket = data.find(b => b.name === 'loans')
    if (loansBucket) {
        console.log("Bucket 'loans' exists.")
    } else {
        console.log("Bucket 'loans' DOES NOT exist.")
    }
}

main()

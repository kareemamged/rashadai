import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://voiwxfqryobznmxgpamq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXd4ZnFyeW9iem5teGdwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMzc3MzksImV4cCI6MjA2MTgxMzczOX0.K0szF8vOTyjQcBDS74qVA2yHJJgNXVym2L4b5giqqPU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('count');
        console.log('Connection test:', error ? 'Failed' : 'Success');
        console.log('Error:', error);
        console.log('Data:', data);
    } catch (e) {
        console.error('Connection error:', e);
    }
}

async function checkSpecificUser(email) {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('email', email);
        console.log(`User with email ${email}:`);
        console.log(data);
        console.log('Error:', error);
    } catch (e) {
        console.error('Error checking user:', e);
    }
}

async function signInUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        console.log('Sign in result:');
        console.log(data);
        console.log('Error:', error);
    } catch (e) {
        console.error('Sign in error:', e);
    }
}

async function checkFunction(name) {
    try {
        const { data, error } = await supabase.rpc(name, {});
        console.log(`Function ${name}:`, error ? 'Exists but error' : 'Exists');
        console.log('Error:', error);
    } catch (e) {
        console.log(`Function ${name}: Does not exist or not accessible`);
        console.log('Error:', e.message);
    }
}

async function main() {
    console.log('=== Checking Supabase Connection ===');
    await checkConnection();

    console.log('\n=== Checking User test@gmail.com ===');
    await checkSpecificUser('test@gmail.com');

    console.log('\n=== Checking User test@user.com ===');
    await checkSpecificUser('test@user.com');

    console.log('\n=== Trying to Sign In with test@user.com ===');
    await signInUser('test@user.com', 'password123');

    console.log('\n=== Checking RPC Functions ===');
    await checkFunction('check_email_confirmed_alt');
    await checkFunction('simple_auth_check');
    await checkFunction('direct_register_user');
}

main().catch(console.error);
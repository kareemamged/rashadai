const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://voiwxfqryobznmxgpamq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin privileges

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBlogTables() {
  try {
    // Read SQL files
    const blogPostsTableSQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'blog_posts_table.sql'),
      'utf8'
    );

    const addForeignKeySQL = fs.readFileSync(
      path.join(__dirname, 'supabase', 'add_blog_posts_foreign_key.sql'),
      'utf8'
    );

    console.log('Creating blog_posts table and related objects...');

    // Execute SQL using Supabase's rpc function
    // Note: This requires the 'exec_sql' function to be created in your Supabase project
    const { data: result, error } = await supabase.rpc('exec_sql', {
      sql: blogPostsTableSQL
    });

    if (error) {
      console.error('Error creating blog tables:', error);

      // Alternative approach: Execute SQL statements one by one
      console.log('Trying alternative approach for blog_posts_table.sql...');

      // Split SQL into individual statements
      const statements = blogPostsTableSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const stmt of statements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
          if (error) {
            console.error(`Error executing statement: ${stmt}`);
            console.error(error);
          }
        } catch (stmtError) {
          console.error(`Exception executing statement: ${stmt}`);
          console.error(stmtError);
        }
      }
    } else {
      console.log('Blog tables created successfully');
    }

    // Now add the foreign key relationship
    console.log('Adding foreign key relationship between blog_posts and profiles...');

    const { data: fkResult, error: fkError } = await supabase.rpc('exec_sql', {
      sql: addForeignKeySQL
    });

    if (fkError) {
      console.error('Error adding foreign key relationship:', fkError);

      // Alternative approach: Execute SQL statements one by one
      console.log('Trying alternative approach for add_blog_posts_foreign_key.sql...');

      // Split SQL into individual statements
      const fkStatements = addForeignKeySQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const stmt of fkStatements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
          if (error) {
            console.error(`Error executing statement: ${stmt}`);
            console.error(error);
          }
        } catch (stmtError) {
          console.error(`Exception executing statement: ${stmt}`);
          console.error(stmtError);
        }
      }
    } else {
      console.log('Foreign key relationship added successfully');
    }

    // Insert sample data if tables are empty
    await insertSampleData();

    console.log('Blog tables setup completed');
  } catch (error) {
    console.error('Error setting up blog tables:', error.message);
  }
}

async function insertSampleData() {
  try {
    // Check if blog_posts table is empty
    const { count: postsCount, error: postsCountError } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });

    if (!postsCountError && postsCount === 0) {
      console.log('Inserting sample blog posts...');

      // Get admin user ID
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      const adminId = adminData && adminData.length > 0 ? adminData[0].id : null;

      // Sample blog posts
      const samplePosts = [
        {
          title_en: 'Getting Started with AI Medical Consultations',
          title_ar: 'بدء الاستشارات الطبية بالذكاء الاصطناعي',
          content_en: 'AI medical consultations are revolutionizing healthcare by providing accessible medical advice. This guide will help you understand how to get the most out of your AI consultation experience.',
          content_ar: 'تُحدث الاستشارات الطبية بالذكاء الاصطناعي ثورة في الرعاية الصحية من خلال تقديم المشورة الطبية بشكل سهل الوصول. سيساعدك هذا الدليل على فهم كيفية الاستفادة القصوى من تجربة الاستشارة بالذكاء الاصطناعي.',
          category: 'tips',
          published: true,
          author_id: adminId,
          image_url: '/images/blog/ai-consultation.jpg'
        },
        {
          title_en: 'Understanding AI Diagnosis Limitations',
          title_ar: 'فهم قيود التشخيص بالذكاء الاصطناعي',
          content_en: 'While AI can provide valuable medical insights, it is important to understand its limitations. This article explains what AI can and cannot diagnose, and when you should seek traditional medical care.',
          content_ar: 'بينما يمكن للذكاء الاصطناعي تقديم رؤى طبية قيمة، من المهم فهم قيوده. يشرح هذا المقال ما يمكن للذكاء الاصطناعي تشخيصه وما لا يمكنه، ومتى يجب عليك طلب الرعاية الطبية التقليدية.',
          category: 'tips',
          published: false,
          author_id: adminId,
          image_url: '/images/blog/ai-limitations.jpg'
        },
        {
          title_en: 'New Features Coming to Our Platform',
          title_ar: 'ميزات جديدة قادمة إلى منصتنا',
          content_en: 'We are excited to announce several new features coming to our platform in the next update. These improvements will enhance your experience and provide more comprehensive healthcare options.',
          content_ar: 'يسعدنا أن نعلن عن العديد من الميزات الجديدة القادمة إلى منصتنا في التحديث القادم. ستعمل هذه التحسينات على تعزيز تجربتك وتوفير خيارات رعاية صحية أكثر شمولاً.',
          category: 'news',
          published: true,
          author_id: adminId,
          image_url: '/images/blog/new-features.jpg'
        }
      ];

      // Insert sample posts
      for (const post of samplePosts) {
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(post);

        if (insertError) {
          console.error('Error inserting sample post:', insertError);
        }
      }

      console.log('Sample blog posts inserted successfully');
    }

    // Check if blog_comments table is empty
    const { count: commentsCount, error: commentsCountError } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true });

    if (!commentsCountError && commentsCount === 0) {
      console.log('Inserting sample blog comments...');

      // Get posts
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id')
        .limit(3);

      if (!postsError && posts && posts.length > 0) {
        // Get some user IDs
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id')
          .limit(5);

        if (!usersError && users && users.length > 0) {
          // Sample comments
          const sampleComments = [
            {
              post_id: posts[0].id,
              user_id: users[0].id,
              content: 'This was very helpful! I learned a lot about how to prepare for my AI consultation.',
              approved: true
            },
            {
              post_id: posts[0].id,
              user_id: users[1].id,
              content: 'I have a question about the privacy of these consultations. Is my data secure?',
              approved: false
            },
            {
              post_id: posts[2].id,
              user_id: users[2].id,
              content: 'Looking forward to the new features! Will there be support for more languages?',
              approved: true
            }
          ];

          // Insert sample comments
          for (const comment of sampleComments) {
            const { error: insertError } = await supabase
              .from('blog_comments')
              .insert(comment);

            if (insertError) {
              console.error('Error inserting sample comment:', insertError);
            }
          }

          console.log('Sample blog comments inserted successfully');
        }
      }
    }
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

setupBlogTables();

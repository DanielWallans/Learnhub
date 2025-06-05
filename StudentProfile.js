import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';

const StudentProfile = () => {
  const [institution, setInstitution] = useState('');
  const [age, setAge] = useState('');
  const [study, setStudy] = useState('');
  const [grade, setGrade] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      await db.collection('students').doc(user.uid).set({
        institution,
        age,
        study,
        grade,
        userId: user.uid
      });
      alert('Profile created successfully!');
    } else {
      alert('No user is signed in');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Institution:
        <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} />
      </label>
      <label>
        Age:
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      </label>
      <label>
        Study:
        <input type="text" value={study} onChange={(e) => setStudy(e.target.value)} />
      </label>
      <label>
        Grade:
        <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} />
      </label>
      <button type="submit">Create Profile</button>
    </form>
  );
};

export default StudentProfile;
